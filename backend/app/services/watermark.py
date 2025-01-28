import cv2
import numpy as np

def embed_watermark(image_bytes: bytes, watermark: str) -> bytes:
    """DCT watermark embedding"""
    # 将字节流转为OpenCV图像
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 转换为YUV颜色空间（亮度通道更适合嵌入）
    img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    
    # 对Y通道做DCT变换
    y_channel = np.float32(img_yuv[:,:,0]) / 255.0
    dct = cv2.dct(y_channel)
    
    # 在特定频段嵌入水印（示例位置）
    rows, cols = 50, 50
    dct[rows:rows+8, cols:cols+8] += np.frombuffer(watermark.encode(), np.float32).reshape(8,8) * 0.01
    
    # 逆变换
    y_watermarked = cv2.idct(dct) * 255.0
    img_yuv[:,:,0] = np.clip(y_watermarked, 0, 255).astype(np.uint8)
    
    # 转回BGR并编码为字节流
    result_img = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2BGR)
    _, encoded_img = cv2.imencode('.png', result_img)
    return encoded_img.tobytes()

def test_embed_watermark():
    # 1. 从磁盘读取原图为字节流
    with open("../../tests/test.jpg", "rb") as f:
        original_bytes = f.read()
    
    # 2. 调用 embed_watermark，得到水印后的字节流
    watermark = "A"*256  # 简单填充256个字符
    watermarked_bytes = embed_watermark(original_bytes, watermark)

    # 3. 分别把原图字节流和水印后字节流再解码成 OpenCV 图像格式
    original_img = cv2.imdecode(np.frombuffer(original_bytes, np.uint8), cv2.IMREAD_COLOR)
    watermarked_img = cv2.imdecode(np.frombuffer(watermarked_bytes, np.uint8), cv2.IMREAD_COLOR)

    # 4. 并排放在一起（水平拼接）
    comparison = cv2.hconcat([original_img, watermarked_img])

    # 5. 显示比较图
    cv2.imshow("Original (Left) vs Watermarked (Right)", comparison)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    test_embed_watermark()