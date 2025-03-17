from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from utils.image_utils import generate_qr_code
import cv2
import multiprocessing
import numpy as np
import base64
from PIL import Image
import os
router = APIRouter()
import multiprocessing
from services.EthService import EthService
from services.SolService import SolService

# 1 **Monkey Patch `multiprocessing.set_start_method()`**
def no_op(*args, **kwargs):
    pass

multiprocessing.set_start_method = no_op  # replace `set_start_method`

from blind_watermark import WaterMark  # Now `blind_watermark` won't  call `set_start_method('fork')`

del multiprocessing.set_start_method  

from blind_watermark import WaterMark
import numpy as np

def register_on_chain(chain: str, key: str, image_data: bytes) -> str:
    """
    Simulate registering the image on a blockchain using the provided chain and wallet key.
    Replace this with actual blockchain interaction logic.
    """
    if chain in ["ETH"]:
        blockchain_service = EthService()
        tx_hash = blockchain_service.register_image(image_data)
    elif chain in ["SOL"]:
        blockchain_service = SolService()
        tx_hash = blockchain_service.register_image(image_data)
    else:
        pass
    return tx_hash  # Placeholder transaction hash

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    chain: str = Form(...),
    key: str = Form(...)
):
    # Validate that the uploaded file is an image
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only images are allowed")
    
    try:
        print("chain: ", chain)
        print("key: ", key)
        # Read the uploaded image as bytes
        image_data = await file.read()
        file_size = len(image_data)  # Calculate file size in bytes
        min_size = 1024 * 1024  # 1MB

        if file_size < min_size:
            raise HTTPException(status_code=400, detail="Image size too small (must be at least 1MB)")

        print(f"File size: {file_size / 1024:.2f} KB")  # Print file size in KB

        tx_hash = register_on_chain(chain, key, image_data)
        # Define the URL for the QR code
        if chain == "ETH":
            url = f"https://sepolia.etherscan.io/tx/${tx_hash}" # Replace with your desired URL
        elif chain == "SOL":
            url = f"https://explorer.solana.com/tx/${tx_hash}?cluster=devnet"
        # Generate the QR code (assuming generate_qr_code returns a PIL Image)
        qr_img = generate_qr_code(url)
        qr_np = np.array(qr_img.convert('L'))
        wm_bit = qr_np.flatten() > 128  # [1,0,0,0,1,1...] 1 x (128*128)

        # Convert bytes to NumPy array
        image_np = np.asarray(bytearray(image_data), dtype=np.uint8)
        image_cv = cv2.imdecode(image_np, cv2.IMREAD_UNCHANGED)

        if image_cv is None:
            raise HTTPException(status_code=400, detail="Invalid image format or corrupted file")

        # Ensure it's in BGR format (convert from grayscale or BGRA if needed)
        if len(image_cv.shape) == 2:  # Grayscale, convert to 3-channel BGR
            image_cv = cv2.cvtColor(image_cv, cv2.COLOR_GRAY2BGR)
        elif image_cv.shape[2] == 4:  # If BGRA, convert to BGR
            image_cv = cv2.cvtColor(image_cv, cv2.COLOR_BGRA2BGR)

        print("Read image and watermark")

        bwm1 = WaterMark()
        bwm1.read_img(img=image_cv)  # Pass the NumPy array
        bwm1.read_wm(wm_bit, mode='bit')

        print(type(image_cv), image_cv.shape)

        embed_image = bwm1.embed()
    
        # Extract the watermark from the embedded image in memory
        wm_extract = bwm1.extract(embed_img=embed_image, wm_shape=(128, 128), mode='bit')
        if wm_extract.ndim == 1:
            wm_extract = wm_extract.reshape((128, 128))
        # Convert extracted watermark to 8-bit for saving
        wm_img = (wm_extract > 0.5).astype(np.uint8) * 255

        # Encode the embedded image to JPEG bytes
        success_embed, embed_buf = cv2.imencode('.jpg', embed_image)
        if not success_embed:
            raise HTTPException(status_code=500, detail="Error encoding embedded image to JPEG")

        embed_bytes = embed_buf.tobytes()
        embed_b64 = base64.b64encode(embed_bytes).decode('utf-8')

        # Encode the extracted watermark to JPEG bytes
        success_wm, wm_buf = cv2.imencode('.jpg', wm_img)
        if not success_wm:
            raise HTTPException(status_code=500, detail="Error encoding watermark image to JPEG")

        wm_bytes = wm_buf.tobytes()
        wm_b64 = base64.b64encode(wm_bytes).decode('utf-8')

        # Register on the blockchain using chain and key

        # Return both images and transaction hash as base64-encoded strings in a JSON response
        ret = {
            "embedded": {
                "data": embed_b64,
                "type": "image/jpeg"
            },
            "extracted": {
                "data": wm_b64,
                "type": "image/jpeg"
            },
            "txHash": tx_hash
        }
        return ret
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
@router.post("/extract")
async def extract_image(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "only images are allowed")
    
    try:
        image_data = await file.read()
        
        extracted_img = None
        
        return {
            "image_base64": f"data:image/png;base64,{extracted_img.decode('latin1')}"
        }
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")