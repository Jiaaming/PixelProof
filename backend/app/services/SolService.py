import hashlib
import base58
import os
from dotenv import load_dotenv
from typing import Optional
from solana.rpc.api import Client
from solders.instruction import Instruction, AccountMeta
from solders.transaction import Transaction
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solders.system_program import ID as SYS_PROGRAM_ID
from solders.message import Message

class SolService:
    def __init__(self, network_rpc: Optional[str] = None, private_key: Optional[str] = None, 
                 program_id: Optional[str] = None):
        """
        Initialize the SolService class to interact with a Solana program on the devnet.
        
        Args:
            network_rpc (str, optional): Solana devnet RPC URL. Defaults to environment variable SOLANA_DEVNET_RPC.
            private_key (str, optional): Base58-encoded private key. Defaults to environment variable SOLANA_PRIVATE_KEY.
            program_id (str, optional): Solana program ID. Defaults to environment variable SOLANA_PROGRAM_ID.
        """
        # Load environment variables
        load_dotenv()
        
        # Initialize Solana client
        self.client = Client(network_rpc or os.getenv("SOLANA_DEVNET_RPC"))
        if not self.client.is_connected():
            raise ConnectionError("Failed to connect to Solana devnet. Check your RPC URL.")
        print("Connected to Solana devnet")
        
        # Load wallet private key (assuming base58-encoded 64-byte keypair)
        private_key_str = private_key or os.getenv("SOLANA_PRIVATE_KEY")
        if not private_key_str:
            raise ValueError("No private key provided or found in environment variables.")
        private_key_bytes = base58.b58decode(private_key_str)
        self.wallet = Keypair.from_bytes(private_key_bytes)
        
        # Load program ID
        program_id_str = program_id or os.getenv("SOLANA_PROGRAM_ID")
        if not program_id_str:
            raise ValueError("No program ID provided or found in environment variables.")
        self.program_id = Pubkey.from_string(program_id_str)
        
    def register_image(self, image_data: bytes) -> str:
        """
        Register an image hash on the Solana blockchain.
        
        Args:
            image_data (bytes): The image data to hash and register.
        
        Returns:
            str: The transaction signature (hash) as a string.
        
        Raises:
            Exception: If the transaction fails to send.
        """
        # Compute the 32-byte SHA256 hash of the image data
        image_hash = hashlib.sha256(image_data).digest()
        print(f"Image hash: {image_hash.hex()}")  
        # Compute the instruction discriminator (first 8 bytes of SHA256("global:register_image"))
        discriminator = hashlib.sha256(b"global:register_image").digest()[:8]
  
        # Derive program-derived addresses (PDAs) for hash_account and owner_account
        hash_account, hash_bump = Pubkey.find_program_address([b"hash", image_hash], self.program_id)
        owner_account, owner_bump = Pubkey.find_program_address([b"owner", bytes(self.wallet.pubkey())], self.program_id) 

        instruction_data = (
            discriminator +           # 8字节
            image_hash +              # 32字节
            bytes([hash_bump]) +      # 1字节
            bytes([owner_bump])       # 1字节
        )  # 总共 42字节
              
        # Define the accounts required by the RegisterImage instruction
        accounts = [
            AccountMeta(pubkey=hash_account, is_signer=False, is_writable=True),      # hash_account (writable)
            AccountMeta(pubkey=owner_account, is_signer=False, is_writable=True),    # owner_account (writable)
            AccountMeta(pubkey=self.wallet.pubkey(), is_signer=True, is_writable=True), # author (signer, writable)
            AccountMeta(pubkey=SYS_PROGRAM_ID, is_signer=False, is_writable=False),  # system_program (read-only)
        ]
        
        # Create the transaction instruction
        instruction = Instruction(
            program_id=self.program_id,
            accounts=accounts,
            data=instruction_data
        )
        
        # Build the transaction
        recent_blockhash = self.client.get_latest_blockhash().value.blockhash
        message = Message(
                payer=self.wallet.pubkey(),
                instructions=[instruction],
            )
        
        transaction = Transaction([self.wallet], message, recent_blockhash)
        
         # Sign the transaction
        transaction.sign([self.wallet], recent_blockhash)
        
        # Send the transaction
        try:
            response = self.client.send_raw_transaction(bytes(transaction))
            tx_signature = response.value
            print(f"Image registered on the blockchain with transaction signature: {tx_signature}")
            return str(tx_signature), str(image_hash.hex())
        except Exception as e:
            print(f"Error registering image: {e}")
            raise