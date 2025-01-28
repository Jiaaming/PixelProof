from fastapi import APIRouter, File, UploadFile, HTTPException
from services.watermark import embed_watermark
from services.blockchain import register_image
import hashlib

router = APIRouter()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "only images are allowed")
    
    try:
        image_data = await file.read()

        watermarked_img = embed_watermark(image_data, "MySecretWatermark")
        
        img_hash = hashlib.sha256(watermarked_img).hexdigest()
        
        tx_hash = register_image(img_hash)
        
        return {
            "tx_hash": tx_hash,
            "image_base64": f"data:image/png;base64,{watermarked_img.decode('latin1')}"
        }
    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")