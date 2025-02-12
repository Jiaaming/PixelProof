# watermark.py
import cv2
import numpy as np

def embed_watermark(image_bytes: bytes, watermark: str,
                    rows: int = 50, cols: int = 50) -> bytes:
    """
    将 watermark 字符串嵌入到图像的 (rows:rows+8, cols:cols+8) DCT 区域。
    返回带水印的 PNG 格式字节流。
    """
    # 1. 字节流 -> OpenCV 图像 (BGR)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("无法解码原始图像，请检查输入字节流是否正确")

    # 2. 转 YUV，并只对 Y 通道嵌入
    img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    y_channel = np.float32(img_yuv[:, :, 0]) / 255.0

    # 3. 对 Y 通道做 DCT
    dct = cv2.dct(y_channel)

    # 4. 将 (rows:rows+8, cols:cols+8) 区域“先置零”，再写入水印
    #    watermark.encode() -> bytes; np.frombuffer(..., np.float32) -> float32数组
    #    注意：如果 watermark 长度不是 64 字节的整数倍，会出错或结果不一致
    block_size = 8
    encoded = watermark.encode("utf-8")
    float_array = np.frombuffer(encoded, np.float32)

    capacity = block_size * block_size  # 64
    if float_array.size > capacity:
        # 截断
        float_array = float_array[:capacity]
    elif float_array.size < capacity:
        # 填充
        padded = np.zeros(capacity, dtype=np.float32)
        padded[:float_array.size] = float_array
        float_array = padded

    # 此时 float_array.size 一定 == capacity
    dct[rows:rows+block_size, cols:cols+block_size] = 0
    dct[rows:rows+block_size, cols:cols+block_size] += float_array.reshape(block_size, block_size) * 0.01

    # 5. 逆变换，更新 Y 通道
    y_watermarked = cv2.idct(dct) * 255.0
    img_yuv[:, :, 0] = np.clip(y_watermarked, 0, 255).astype(np.uint8)

    # 6. 转回 BGR 并编码为 PNG 字节流
    result_img = cv2.cvtColor(img_yuv, cv2.COLOR_YUV2BGR)
    success, encoded_img = cv2.imencode('.png', result_img)
    if not success:
        raise RuntimeError("OpenCV 图像编码失败")
    return encoded_img.tobytes()


def extract_watermark(image_bytes: bytes,
                      rows: int = 50, cols: int = 50) -> str:
    """
    从图像的 (rows:rows+8, cols:cols+8) DCT 区域读取水印，
    并尝试还原成原始字符串。
    """
    # 1. 字节流 -> OpenCV 图像 (BGR)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("无法解码水印图像，请检查输入字节流是否正确")

    # 2. 转 YUV，对 Y 通道做 DCT
    img_yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    y_channel = np.float32(img_yuv[:, :, 0]) / 255.0
    dct = cv2.dct(y_channel)

    # 3. 读取同一块区域的浮点值，并除以 0.01 还原
    block_size = 8
    block = dct[rows:rows+block_size, cols:cols+block_size]
    extracted_f32 = (block / 0.01).astype(np.float32).flatten()  # 64 float32

    # 4. 转回字节再解码成字符串
    extracted_bytes = extracted_f32.tobytes()
    # decode 时可能遇到非可打印字符，因此要忽略错误或另行处理
    watermark_str = extracted_bytes.decode('utf-8', errors='ignore')

    return watermark_str