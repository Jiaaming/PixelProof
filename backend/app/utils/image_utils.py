import os
import numpy as np
import pywt
from PIL import Image
from scipy.fftpack import dct, idct

"""
For test purpose.
"""
def load_image_original(image_path):

    img = Image.open(image_path).convert('RGB')
    return np.array(img, dtype=np.float64)

def load_watermark_original(watermark_path):

    wm_img = Image.open(watermark_path).convert('L')
    return np.array(wm_img, dtype=np.float64)

def apply_dct_2d(channel_2d):
    """对某个单通道做 8×8 分块的 DCT"""
    h, w = channel_2d.shape
    dct_block = np.zeros((h, w), dtype=np.float64)
    # 遍历每个 8×8 块做 DCT
    for i in range(0, h, 8):
        for j in range(0, w, 8):
            block = channel_2d[i:i+8, j:j+8]
            # 如果不是8的倍数，需做pad(演示略)
            block_dct = dct(dct(block.T, norm='ortho').T, norm='ortho')
            dct_block[i:i+8, j:j+8] = block_dct
    return dct_block

def inverse_dct_2d(dct_block):
    """对某个单通道做 8×8 分块的 逆DCT"""
    h, w = dct_block.shape
    channel_idct = np.zeros((h, w), dtype=np.float64)
    for i in range(0, h, 8):
        for j in range(0, w, 8):
            block = dct_block[i:i+8, j:j+8]
            block_idct = idct(idct(block.T, norm='ortho').T, norm='ortho')
            channel_idct[i:i+8, j:j+8] = block_idct
    return channel_idct

def embed_watermark(dct_channel, wm_array):
    """
    在 dct_channel 的 8×8 块 (5,5) 处嵌入水印数组 wm_array。
    假设 wm_array.shape = (wm_h, wm_w)，必须保证 wm_h*wm_w <= 8×8块数
    """
    h, w = dct_channel.shape
    wm_h, wm_w = wm_array.shape
    wm_flat = wm_array.ravel()
    total_blocks = (h // 8) * (w // 8)

    if wm_flat.size > total_blocks:
        raise ValueError("水印过大，无法完整嵌入！")

    idx = 0
    for i in range(0, h, 8):
        for j in range(0, w, 8):
            if idx < wm_flat.size:
                dct_channel[i+5, j+5] = wm_flat[idx]
                idx += 1
            else:
                break
    return dct_channel

def extract_watermark(dct_channel, wm_h, wm_w):

    h, w = dct_channel.shape

    extracted = []
    idx = 0
    for i in range(0, h, 8):
        for j in range(0, w, 8):
            if idx < wm_h * wm_w:
                extracted.append(dct_channel[i+5, j+5])
                idx += 1
            else:
                break

    extracted = np.array(extracted).reshape(wm_h, wm_w)
    return extracted

def resize_watermark(wm_path, max_width, max_height):
    wm_img = Image.open(wm_path).convert('L')
    wm_img = wm_img.resize((max_width, max_height), Image.Resampling.LANCZOS)
    return np.array(wm_img, dtype=np.float64)

def extract_watermark_from_file(watermarked_image_path, wm_h, wm_w, wavelet='haar', level=1):
    watermarked_img = Image.open(watermarked_image_path).convert('RGB')
    watermarked_array = np.array(watermarked_img, dtype=np.float64)

    # 分离R通道(因为水印嵌入在R通道)
    R_received = watermarked_array[:, :, 0]

    # 小波分解
    coeffsR_received = pywt.wavedec2(R_received, wavelet=wavelet, level=level)
    cA_received = coeffsR_received[0]

    # DCT变换
    dct_cA_received = apply_dct_2d(cA_received)

    # 提取水印
    extracted_wm = extract_watermark(dct_cA_received, wm_h, wm_w)

    # 后处理并保存
    extracted_wm = np.clip(extracted_wm, 0, 255).astype(np.uint8)
    Image.fromarray(extracted_wm).save('result/recovered_watermark_from_file.jpg')
    print("从文件提取的水印已保存到 result/recovered_watermark_from_file.jpg")

def w2d_color_example(image_path, wm_path, wavelet='haar', level=1):
    # 1. 读入彩色原图
    color_img = load_image_original(image_path)
    # 分离 R/G/B 通道
    R, G, B = color_img[:,:,0], color_img[:,:,1], color_img[:,:,2]

    # 2. 读入水印并获得水印大小
    wm_array = resize_watermark(wm_path, 64, 64)    
    wm_h, wm_w = wm_array.shape

    # 3. 对 R 通道做小波分解
    coeffsR = pywt.wavedec2(R, wavelet=wavelet, level=level)
    # coeffsR 是 [cA, (cH, cV, cD)] 这样的结构。这里 cA = coeffsR[0] 即为最低频 LL 子带
    cA = coeffsR[0]

    # 4. 对最低频 cA 做 8×8 块的 DCT
    dct_cA = apply_dct_2d(cA)

    # 5. 将水印嵌入到 dct_cA 中
    dct_cA_marked = embed_watermark(dct_cA, wm_array)

    # 6. 逆DCT
    cA_marked = inverse_dct_2d(dct_cA_marked)

    # 7. 将逆DCT后的 cA 替换回小波系数，再做逆小波
    coeffsR[0] = cA_marked
    R_marked = pywt.waverec2(coeffsR, wavelet)

    # 8. 合并回原图的 G, B 通道
    #    （可以适当做np.clip到[0,255]再转float64/int等）
    R_marked = np.clip(R_marked, 0, 255)
    watermarked_img = np.dstack((R_marked, G, B)).astype(np.uint8)

    # 9. 保存带水印的彩色图
    os.makedirs('result', exist_ok=True)
    Image.fromarray(watermarked_img).save('result/image_with_watermark.jpg')

    # ============ 水印提取部分演示 ============
    os.makedirs('result', exist_ok=True)
    output_path = 'result/image_with_watermark.jpg'
    Image.fromarray(watermarked_img).save(output_path)

    # ==== 修改后的提取调用 ====
    # 直接从保存的文件中提取水印
    extract_watermark_from_file(
        watermarked_image_path=output_path,
        wm_h=wm_array.shape[0],
        wm_w=wm_array.shape[1],
        wavelet=wavelet,
        level=level
    )

if __name__ == "__main__":
    w2d_color_example("pictures/imagetest1.jpg", "pictures/qrcode.png")