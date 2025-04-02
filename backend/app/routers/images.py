from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from sympy import im
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

# $ mkdir ~/lib
# $ ln -s $(brew --prefix zbar)/lib/libzbar.dylib ~/lib/libzbar.dylib

router = APIRouter()

# 1 **Monkey Patch `multiprocessing.set_start_method()`**
def no_op(*args, **kwargs):
    pass

multiprocessing.set_start_method = no_op  # replace `set_start_method`

from blind_watermark import WaterMark


def register_on_chain(chain: str, key: str, image_data: bytes) -> str:
    if chain in ["ETH"]:
        blockchain_service = EthService()
        tx_hash, image_hash = blockchain_service.register_image(image_data)
    elif chain in ["SOL"]:
        blockchain_service = SolService()
        tx_hash, image_hash = blockchain_service.register_image(image_data)
    else:
        tx_hash = ""
    return tx_hash, image_hash


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

        tx_hash, image_hash = register_on_chain(chain, key, image_data)

        if chain == "ETH":
            url = f"https://sepolia.etherscan.io/tx/0x{tx_hash}"
        elif chain == "SOL":
            url = f"https://explorer.solana.com/tx/{tx_hash}?cluster=devnet"

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
            "txHash": tx_hash,
            "imageHash": image_hash,
            
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: Your image has already been registered")


@router.post("/workspace/decode")
async def decode_image(file: UploadFile = File(...)):
    # Validate that the uploaded file is an image
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only images are allowed")

    try:
        # Read the uploaded image data
        image_data = await file.read()
        
        # Convert to RGB using PIL and then to BGR for OpenCV
        pil_img_rgb = Image.open(BytesIO(image_data)).convert("RGB")
        image_cv = cv2.cvtColor(np.array(pil_img_rgb), cv2.COLOR_RGB2BGR)

        # Verify the image conversion
        if image_cv is None or not isinstance(image_cv, np.ndarray):
            raise HTTPException(status_code=400, detail="Failed to convert image to OpenCV format")

        # Ensure the image has 3 channels (BGR)
        if len(image_cv.shape) != 3 or image_cv.shape[2] != 3:
            image_cv = cv2.cvtColor(image_cv, cv2.COLOR_GRAY2BGR)

        # Extract the watermark using the same process as upload_image
        bwm1 = WaterMark()
        try:
            wm_extract = bwm1.extract(embed_img=image_cv, wm_shape=(128, 128), mode='bit')
            if wm_extract is None:
                raise HTTPException(status_code=400, detail="Failed to extract watermark: got None")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract watermark: {str(e)}")

        # Reshape the extracted watermark if it's 1D
        if wm_extract.ndim == 1:
            wm_extract = wm_extract.reshape((128, 128))

        # Convert to a binary image (0s and 255s), matching upload_image
        wm_img = (wm_extract > 0.5).astype(np.uint8) * 255

        # Save the extracted image for debugging
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            success, wm_buf = cv2.imencode('.jpg', wm_img)
            if success:
                tmp_file.write(wm_buf.tobytes())
                debug_path = tmp_file.name
            else:
                debug_path = "Failed to save extracted image"

        # Encode the extracted image as base64 for the response
        success, wm_buf = cv2.imencode('.jpg', wm_img)
        if not success:
            raise HTTPException(status_code=500, detail="Error encoding extracted image to JPEG")
        wm_bytes = wm_buf.tobytes()
        wm_b64 = base64.b64encode(wm_bytes).decode('utf-8')
        print(f"Extracted image saved at: {debug_path}")
        # Return the extracted image and debug path
        return {
            "extracted": {"data": wm_b64, "type": "image/jpeg"},
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

