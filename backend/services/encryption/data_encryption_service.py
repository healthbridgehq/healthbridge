from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization
import base64
import os
from datetime import datetime
import jwt
from fastapi import HTTPException
from pydantic import BaseModel

class KeyPair(BaseModel):
    public_key: str
    private_key: str
    created_at: datetime

class DataEncryptionService:
    def __init__(self):
        self.master_key = os.environ.get('MASTER_KEY')
        if not self.master_key:
            self.master_key = Fernet.generate_key()
            # In production, this should be stored securely
        
        self.fernet = Fernet(self.master_key)
        self.key_pairs: Dict[str, KeyPair] = {}

    def generate_key_pair(self, user_id: str) -> KeyPair:
        """Generate a new RSA key pair for a user"""
        try:
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )
            
            public_key = private_key.public_key()
            
            # Serialize keys
            private_pem = private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            )
            
            public_pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            
            # Create key pair
            key_pair = KeyPair(
                public_key=public_pem.decode(),
                private_key=private_pem.decode(),
                created_at=datetime.utcnow()
            )
            
            # Store key pair
            self.key_pairs[user_id] = key_pair
            
            return key_pair
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Key generation failed: {str(e)}")

    def encrypt_data(self, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Encrypt data using user's public key"""
        try:
            # Get user's key pair
            key_pair = self.key_pairs.get(user_id)
            if not key_pair:
                key_pair = self.generate_key_pair(user_id)
            
            # Serialize data
            data_bytes = str(data).encode()
            
            # Load public key
            public_key = serialization.load_pem_public_key(
                key_pair.public_key.encode()
            )
            
            # Encrypt data
            encrypted_data = public_key.encrypt(
                data_bytes,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            return {
                "encrypted_data": base64.b64encode(encrypted_data).decode(),
                "encryption_date": datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Encryption failed: {str(e)}")

    def decrypt_data(self, encrypted_data: str, user_id: str) -> Dict[str, Any]:
        """Decrypt data using user's private key"""
        try:
            # Get user's key pair
            key_pair = self.key_pairs.get(user_id)
            if not key_pair:
                raise ValueError("No key pair found for user")
            
            # Load private key
            private_key = serialization.load_pem_private_key(
                key_pair.private_key.encode(),
                password=None
            )
            
            # Decode and decrypt data
            encrypted_bytes = base64.b64decode(encrypted_data)
            decrypted_data = private_key.decrypt(
                encrypted_bytes,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Parse decrypted data
            return eval(decrypted_data.decode())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Decryption failed: {str(e)}")

    def rotate_keys(self, user_id: str) -> KeyPair:
        """Rotate user's key pair"""
        try:
            # Generate new key pair
            new_key_pair = self.generate_key_pair(user_id)
            
            # Re-encrypt any existing data with new keys
            # This would need to be implemented based on your data storage system
            
            return new_key_pair
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Key rotation failed: {str(e)}")

    def generate_sharing_key(self, user_id: str, recipient_id: str) -> str:
        """Generate a temporary key for sharing data"""
        try:
            # Generate a random key
            sharing_key = Fernet.generate_key()
            
            # Create expiring token containing the sharing key
            token = jwt.encode(
                {
                    'sharing_key': sharing_key.decode(),
                    'user_id': user_id,
                    'recipient_id': recipient_id,
                    'exp': datetime.utcnow().timestamp() + 3600  # 1 hour expiry
                },
                self.master_key,
                algorithm='HS256'
            )
            
            return token
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Sharing key generation failed: {str(e)}")

    def verify_sharing_key(self, token: str) -> Dict[str, Any]:
        """Verify a sharing key token"""
        try:
            # Decode and verify token
            payload = jwt.decode(token, self.master_key, algorithms=['HS256'])
            
            # Check expiration
            if payload['exp'] < datetime.utcnow().timestamp():
                raise ValueError("Sharing key has expired")
            
            return payload
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid sharing key: {str(e)}")

    def share_data(self, data: Dict[str, Any], user_id: str, recipient_id: str) -> Dict[str, Any]:
        """Share encrypted data with another user"""
        try:
            # Generate sharing key
            sharing_token = self.generate_sharing_key(user_id, recipient_id)
            
            # Encrypt data with sharing key
            sharing_key = jwt.decode(sharing_token, self.master_key, algorithms=['HS256'])['sharing_key'].encode()
            temp_fernet = Fernet(sharing_key)
            
            # Encrypt data
            encrypted_data = temp_fernet.encrypt(str(data).encode())
            
            return {
                "encrypted_data": base64.b64encode(encrypted_data).decode(),
                "sharing_token": sharing_token,
                "expiry": datetime.utcnow().timestamp() + 3600
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Data sharing failed: {str(e)}")

    def receive_shared_data(self, encrypted_data: str, sharing_token: str) -> Dict[str, Any]:
        """Receive and decrypt shared data"""
        try:
            # Verify sharing token
            payload = self.verify_sharing_key(sharing_token)
            
            # Get sharing key from token
            sharing_key = payload['sharing_key'].encode()
            temp_fernet = Fernet(sharing_key)
            
            # Decrypt data
            encrypted_bytes = base64.b64decode(encrypted_data)
            decrypted_data = temp_fernet.decrypt(encrypted_bytes)
            
            return eval(decrypted_data.decode())
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Data reception failed: {str(e)}")
