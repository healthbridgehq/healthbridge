from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from base64 import b64encode, b64decode
import os
from typing import Dict, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

class HealthDataEncryption:
    """
    Encryption service following Australian healthcare standards.
    Implements ASD-approved cryptographic algorithms.
    """
    
    def __init__(self, encryption_key: str):
        """Initialize with a base encryption key."""
        self.master_key = encryption_key.encode()
        self.key_iterations = 100_000  # ASD recommended minimum
        
    def _derive_key(self, salt: bytes) -> bytes:
        """Derive a key using PBKDF2 with SHA-256."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=self.key_iterations
        )
        return kdf.derive(self.master_key)
        
    def encrypt_field(self, value: str) -> Dict[str, str]:
        """Encrypt a single field value."""
        try:
            # Generate a unique salt and nonce for each encryption
            salt = os.urandom(16)
            nonce = os.urandom(12)
            
            # Derive encryption key
            key = self._derive_key(salt)
            
            # Encrypt using AES-GCM
            aesgcm = AESGCM(key)
            ciphertext = aesgcm.encrypt(nonce, value.encode(), None)
            
            return {
                "salt": b64encode(salt).decode(),
                "nonce": b64encode(nonce).decode(),
                "ciphertext": b64encode(ciphertext).decode(),
                "version": "v1"  # For future crypto agility
            }
            
        except Exception as e:
            logger.error(f"Field encryption failed: {e}")
            raise
            
    def decrypt_field(self, encrypted_data: Dict[str, str]) -> Optional[str]:
        """Decrypt a single encrypted field value."""
        try:
            # Validate version
            if encrypted_data.get("version") != "v1":
                raise ValueError("Unsupported encryption version")
                
            # Decode components
            salt = b64decode(encrypted_data["salt"])
            nonce = b64decode(encrypted_data["nonce"])
            ciphertext = b64decode(encrypted_data["ciphertext"])
            
            # Derive key and decrypt
            key = self._derive_key(salt)
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            
            return plaintext.decode()
            
        except Exception as e:
            logger.error(f"Field decryption failed: {e}")
            return None
            
    def encrypt_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Encrypt an entire health record."""
        try:
            encrypted_record = {}
            
            # Define fields that should never be encrypted
            non_encrypted_fields = {"id", "created_at", "updated_at", "patient_id"}
            
            for field, value in record.items():
                if field in non_encrypted_fields:
                    encrypted_record[field] = value
                else:
                    # Convert non-string values to JSON
                    if not isinstance(value, str):
                        value = json.dumps(value)
                    encrypted_record[field] = self.encrypt_field(value)
                    
            return encrypted_record
            
        except Exception as e:
            logger.error(f"Record encryption failed: {e}")
            raise
            
    def decrypt_record(self, encrypted_record: Dict[str, Any]) -> Dict[str, Any]:
        """Decrypt an entire health record."""
        try:
            decrypted_record = {}
            
            for field, value in encrypted_record.items():
                if isinstance(value, dict) and "ciphertext" in value:
                    # This is an encrypted field
                    decrypted_value = self.decrypt_field(value)
                    
                    # Try to parse JSON if the original was a complex type
                    try:
                        decrypted_record[field] = json.loads(decrypted_value)
                    except (json.JSONDecodeError, TypeError):
                        decrypted_record[field] = decrypted_value
                else:
                    # This was not an encrypted field
                    decrypted_record[field] = value
                    
            return decrypted_record
            
        except Exception as e:
            logger.error(f"Record decryption failed: {e}")
            raise
            
    def rotate_key(self, old_data: Dict[str, Any], new_key: str) -> Dict[str, Any]:
        """Rotate encryption key for a record."""
        try:
            # Decrypt with old key
            decrypted_data = self.decrypt_record(old_data)
            
            # Create new encryption instance with new key
            new_encryption = HealthDataEncryption(new_key)
            
            # Re-encrypt with new key
            return new_encryption.encrypt_record(decrypted_data)
            
        except Exception as e:
            logger.error(f"Key rotation failed: {e}")
            raise
