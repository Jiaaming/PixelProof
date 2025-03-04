from web3 import Web3
import json
import os
from dotenv import load_dotenv
from web3 import Web3
from typing import Optional
import hashlib

class BlockchainService:
    def __init__(self, network_rpc: Optional[str] = None, private_key: Optional[str] = None, 
                 contract_address: Optional[str] = None, abi_path: str = "contracts/abi.json"):
        # Load environment variables
        load_dotenv()
        
        # Initialize Web3 provider
        self.w3 = Web3(Web3.HTTPProvider(network_rpc or os.getenv("SEPOLIA_RPC"), request_kwargs={'timeout': 10}))
        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to Sepolia testnet. Check your RPC URL.")
        else:
            print("Connected to Sepolia testnet")
        self.private_key = private_key or os.getenv("PRIVATE_KEY")
        self.contract_address = contract_address or os.getenv("ETH_CONTRACT_ADDRESS")
        
        # Load contract ABI
        with open(abi_path) as f:
            contract_abi = json.load(f)
        
        # Initialize contract
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=contract_abi)
        self.account = self.w3.eth.account.from_key(self.private_key)
        
    def register_image(self, image_data: bytes) -> str:
        """Register an image hash on the blockchain"""
        # Compute 32-byte hash as bytes
        image_hash = hashlib.sha256(image_data).digest()

        nonce = self.w3.eth.get_transaction_count(self.account.address)
        try:
            gas_estimate = self.contract.functions.registerImage(image_hash).estimate_gas()
            print("Gas estimate:", gas_estimate)
            tx = self.contract.functions.registerImage(image_hash).build_transaction({
                'chainId': 11155111,  # Sepolia chain ID
                'gas': gas_estimate*2,
                'gasPrice': self.w3.to_wei('1', 'gwei'),
                'nonce': nonce,
            })
            print("Success:", tx)
        except Exception as e:
            print(f"Error: {e}")
            raise

        signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"Image registered on the blockchain with transaction hash: {tx_hash.hex()}")
        print("nonce: ", nonce)
        return tx_hash.hex()