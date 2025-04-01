from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from utils.image_utils import generate_qr_code
import cv2
import multiprocessing
import numpy as np
import base64
from PIL import Image, ExifTags
import os
from io import BytesIO
import tempfile
from services.EthService import EthService
from services.SolService import SolService
from pyzbar.pyzbar import decode

router = APIRouter()

# 1 **Monkey Patch `multiprocessing.set_start_method()`**
def no_op(*args, **kwargs):
    pass

multiprocessing.set_start_method = no_op  # replace `set_start_method`

from blind_watermark import WaterMark


def register_on_chain(chain: str, key: str, image_data: bytes) -> str:
    if chain in ["ETH"]:
        blockchain_service = EthService()
        tx_hash = blockchain_service.register_image(image_data)
    elif chain in ["SOL"]:
        blockchain_service = SolService()
        tx_hash = blockchain_service.register_image(image_data)
    else:
        tx_hash = ""
    return tx_hash


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    chain: str = Form(...),
    key: str = Form(...)
):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only images are allowed")

    try:
        image_data = await file.read()
        file_size = len(image_data)
        min_size = 1024 * 1024

        if file_size < min_size:
            raise HTTPException(status_code=400, detail="Image size too small (must be at least 1MB)")

        tx_hash = register_on_chain(chain, key, image_data)

        if chain == "ETH":
            url = f"https://sepolia.etherscan.io/tx/0x{tx_hash}"
        elif chain == "SOL":
            url = f"https://explorer.solana.com/tx/0x{tx_hash}?cluster=devnet"

        qr_img = generate_qr_code(url)
        qr_np = np.array(qr_img.convert('L'))
        wm_bit = qr_np.flatten() > 128

        pil_img = Image.open(BytesIO(image_data)).convert("RGB")
        image_cv = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        bwm1 = WaterMark()
        bwm1.read_img(img=image_cv)
        bwm1.read_wm(wm_bit, mode='bit')

        embed_image = bwm1.embed()
        wm_extract = bwm1.extract(embed_img=embed_image, wm_shape=(128, 128), mode='bit')
        if wm_extract.ndim == 1:
            wm_extract = wm_extract.reshape((128, 128))
        wm_img = (wm_extract > 0.5).astype(np.uint8) * 255

        success_embed, embed_buf = cv2.imencode('.jpg', embed_image)
        if not success_embed:
            raise HTTPException(status_code=500, detail="Error encoding embedded image to JPEG")
        embed_bytes = embed_buf.tobytes()
        embed_b64 = base64.b64encode(embed_bytes).decode('utf-8')

        success_wm, wm_buf = cv2.imencode('.jpg', wm_img)
        if not success_wm:
            raise HTTPException(status_code=500, detail="Error encoding watermark image to JPEG")
        wm_bytes = wm_buf.tobytes()
        wm_b64 = base64.b64encode(wm_bytes).decode('utf-8')

        return {
            "embedded": {"data": embed_b64, "type": "image/jpeg"},
            "extracted": {"data": wm_b64, "type": "image/jpeg"},
            "txHash": tx_hash
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/workspace/decode")
async def decode_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "only images are allowed")

    try:
        image_data = await file.read()

        # Step 1: try to decode directly from QR code
        pil_img = Image.open(BytesIO(image_data)).convert("L")
        decoded_objs = decode(pil_img)

        if decoded_objs:
            qr_content = decoded_objs[0].data.decode("utf-8")
            return {"link": qr_content}

        # Step 2: try to extract watermark from embedded image
        pil_img_rgb = Image.open(BytesIO(image_data)).convert("RGB")
        image_cv = cv2.cvtColor(np.array(pil_img_rgb), cv2.COLOR_RGB2BGR)

        if image_cv is None or not isinstance(image_cv, np.ndarray):
            raise HTTPException(400, "Failed to convert image to OpenCV format")

        if len(image_cv.shape) != 3 or image_cv.shape[2] != 3:
            image_cv = cv2.cvtColor(image_cv, cv2.COLOR_GRAY2BGR)

        bwm1 = WaterMark()

        try:
            wm_extract = bwm1.extract(embed_img=image_cv, wm_shape=(128, 128), mode='bit')
            if wm_extract is None:
                raise HTTPException(400, "Failed to extract watermark: got None")
        except Exception as e:
            raise HTTPException(400, f"Failed to extract watermark: {str(e)}")

        if wm_extract.ndim == 1:
            wm_extract = wm_extract.reshape((128, 128))

        wm_img = (wm_extract > 0.5).astype(np.uint8) * 255
        qr_pil = Image.fromarray(wm_img)
        decoded_fallback = decode(qr_pil)

        if decoded_fallback:
            qr_content = decoded_fallback[0].data.decode("utf-8")
            return {"link": qr_content}

        raise HTTPException(404, "QR code not found in image or watermark")

    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")
