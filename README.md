<p align="center">
<img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20250127225511.png" alt="Logo" width="200">
</p>

# PixelProof

**Empower your images with invisible watermarking and Web3 on-chain registration.**

**PixelProof** is a lightweight demo project that embeds an invisible watermark into uploaded images, then registers a hash of the watermarked file on the ETH Sepolia and Solana Devnet. 

By combining digital watermarking with blockchain timestamps, you get both proof-of-ownership and a robust way to track potential misuse.

ETH Sepolia Contract address: `0xE9198de7AD40cC1D7940E9eD6A606FB225fD8996`   

## Features

- **Invisible Watermark**: Uses basic DCT/DWT-based algorithms to embed a hidden signature inside images.  
- **Blockchain Registration**: Automatically stores a SHA-256 hash of each watermarked image on the testnet.  
- **Simple API**: Built with FastAPI for easy file upload and retrieval of transaction info.  
- **Zero DB Overhead**: No database required; all essential data is stored in the blockchain event logs.  

## Tech Stack

- **Language & Framework**: Python 3 + FastAPI + Node.js  
- **Image Processing**: OpenCV, Pillow, NumPy  
- **Blockchain**: web3.py for testnet  
- **Infrastructure**: Optional Docker container for quick deployment  

## Quick Start

1. **Install Dependencies**
	```bash
	// under backend/
	pip install -r requirements.txt
	// under frontend/
	npm install
	```

2. **Run the Server**
	```bash
	cd backend/app
	uvicorn main:app --reload
	```

3. **Run Client**
	```bash
	cd frontend/
	npm run dev
	```

4. **Upload an Image**
	- Open your browser at http://localhost:8000
	- Upload an image and let PixelProof embed the watermark
	- View your transaction info (TxHash, block number) on the testnet


## Deployment:	 
Use VScode to open the project, open run and debug, select **Debug Full Stack(FastAPI + Next.js)**. It will start the backend and frontend server at the same time, with debugging enabled.


## For smart contract deployment (use sepolia as an example):   
```bash
cd sepolia/

```
create a .env file in the root directory and add the following:
```bash
PRIVATE_KEY=your_private_key
API_URL=your_infura_url
```

## Disclaimer

- **Educational Use Only**: This project is a proof-of-concept
- **Not Bulletproof**: Watermarking and hash registration provide evidence of ownership but may not prevent all forms of infringement
- **Gas Fees & Real Deployments**: For production, consider gas costs and stronger watermark algorithms

Enjoy experimenting with PixelProof!
