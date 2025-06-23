from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from fastapi import HTTPException
import asyncio
import json
from ..encryption.data_encryption_service import DataEncryptionService

class DataCategory(Enum):
    DEMOGRAPHICS = "demographics"
    MEDICAL_HISTORY = "medical_history"
    MEDICATIONS = "medications"
    ALLERGIES = "allergies"
    IMMUNIZATIONS = "immunizations"
    LAB_RESULTS = "lab_results"
    IMAGING = "imaging"
    PROCEDURES = "procedures"
    VITALS = "vitals"
    NOTES = "notes"

class AccessLevel(Enum):
    NONE = "none"
    READ = "read"
    WRITE = "write"
    FULL = "full"

class DataAccess(BaseModel):
    clinic_id: str
    access_level: AccessLevel
    granted_at: datetime
    expires_at: Optional[datetime]
    categories: List[DataCategory]

class DataVaultItem(BaseModel):
    id: str
    patient_id: str
    category: DataCategory
    data: Dict[str, Any]
    source_clinic: str
    created_at: datetime
    updated_at: datetime
    version: int
    encryption_metadata: Dict[str, Any]
    access_log: List[Dict[str, Any]]

class DataVaultService:
    def __init__(self, encryption_service: DataEncryptionService):
        self.encryption_service = encryption_service
        self.vault: Dict[str, Dict[str, DataVaultItem]] = {}  # patient_id -> {item_id -> item}
        self.access_controls: Dict[str, Dict[str, DataAccess]] = {}  # patient_id -> {clinic_id -> access}
        self.version_history: Dict[str, List[DataVaultItem]] = {}  # item_id -> [versions]

    async def store_data(
        self,
        patient_id: str,
        category: DataCategory,
        data: Dict[str, Any],
        source_clinic: str
    ) -> DataVaultItem:
        """Store encrypted data in the vault"""
        try:
            # Encrypt the data
            encrypted_data = self.encryption_service.encrypt_data(data, patient_id)
            
            # Create vault item
            item = DataVaultItem(
                id=f"{patient_id}_{category.value}_{datetime.utcnow().timestamp()}",
                patient_id=patient_id,
                category=category,
                data=encrypted_data,
                source_clinic=source_clinic,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                version=1,
                encryption_metadata={
                    "algorithm": "RSA-OAEP",
                    "key_id": patient_id,
                    "timestamp": datetime.utcnow().isoformat()
                },
                access_log=[{
                    "action": "create",
                    "timestamp": datetime.utcnow().isoformat(),
                    "actor": source_clinic
                }]
            )
            
            # Store in vault
            if patient_id not in self.vault:
                self.vault[patient_id] = {}
            self.vault[patient_id][item.id] = item
            
            # Initialize version history
            self.version_history[item.id] = [item]
            
            return item
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to store data: {str(e)}")

    async def retrieve_data(
        self,
        patient_id: str,
        category: Optional[DataCategory] = None,
        clinic_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve decrypted data from the vault"""
        try:
            # Verify access if clinic_id is provided
            if clinic_id:
                access = self._verify_access(patient_id, clinic_id, category)
                if not access:
                    raise ValueError("Access denied")
            
            # Get items from vault
            items = []
            if patient_id in self.vault:
                for item in self.vault[patient_id].values():
                    if category and item.category != category:
                        continue
                    
                    # Decrypt data
                    decrypted_data = self.encryption_service.decrypt_data(
                        item.data["encrypted_data"],
                        patient_id
                    )
                    
                    # Log access
                    item.access_log.append({
                        "action": "read",
                        "timestamp": datetime.utcnow().isoformat(),
                        "actor": clinic_id or "patient"
                    })
                    
                    items.append({
                        "id": item.id,
                        "category": item.category.value,
                        "data": decrypted_data,
                        "source_clinic": item.source_clinic,
                        "created_at": item.created_at.isoformat(),
                        "updated_at": item.updated_at.isoformat(),
                        "version": item.version
                    })
            
            return items
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to retrieve data: {str(e)}")

    async def update_data(
        self,
        patient_id: str,
        item_id: str,
        data: Dict[str, Any],
        clinic_id: str
    ) -> DataVaultItem:
        """Update existing data in the vault"""
        try:
            # Verify item exists
            if patient_id not in self.vault or item_id not in self.vault[patient_id]:
                raise ValueError("Item not found")
            
            item = self.vault[patient_id][item_id]
            
            # Verify access
            access = self._verify_access(patient_id, clinic_id, item.category)
            if not access or access.access_level not in [AccessLevel.WRITE, AccessLevel.FULL]:
                raise ValueError("Access denied")
            
            # Encrypt new data
            encrypted_data = self.encryption_service.encrypt_data(data, patient_id)
            
            # Create new version
            new_item = DataVaultItem(
                id=item.id,
                patient_id=patient_id,
                category=item.category,
                data=encrypted_data,
                source_clinic=clinic_id,
                created_at=item.created_at,
                updated_at=datetime.utcnow(),
                version=item.version + 1,
                encryption_metadata={
                    "algorithm": "RSA-OAEP",
                    "key_id": patient_id,
                    "timestamp": datetime.utcnow().isoformat()
                },
                access_log=item.access_log + [{
                    "action": "update",
                    "timestamp": datetime.utcnow().isoformat(),
                    "actor": clinic_id
                }]
            )
            
            # Update vault and version history
            self.vault[patient_id][item_id] = new_item
            self.version_history[item_id].append(new_item)
            
            return new_item
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update data: {str(e)}")

    async def grant_access(
        self,
        patient_id: str,
        clinic_id: str,
        access_level: AccessLevel,
        categories: List[DataCategory],
        duration_days: Optional[int] = None
    ) -> DataAccess:
        """Grant access to patient data"""
        try:
            # Create access control
            access = DataAccess(
                clinic_id=clinic_id,
                access_level=access_level,
                granted_at=datetime.utcnow(),
                expires_at=datetime.utcnow().replace(day=datetime.utcnow().day + duration_days) if duration_days else None,
                categories=categories
            )
            
            # Store access control
            if patient_id not in self.access_controls:
                self.access_controls[patient_id] = {}
            self.access_controls[patient_id][clinic_id] = access
            
            return access
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to grant access: {str(e)}")

    async def revoke_access(
        self,
        patient_id: str,
        clinic_id: str
    ) -> bool:
        """Revoke access to patient data"""
        try:
            if patient_id in self.access_controls and clinic_id in self.access_controls[patient_id]:
                del self.access_controls[patient_id][clinic_id]
                return True
            return False
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to revoke access: {str(e)}")

    def _verify_access(
        self,
        patient_id: str,
        clinic_id: str,
        category: Optional[DataCategory] = None
    ) -> Optional[DataAccess]:
        """Verify clinic's access to patient data"""
        if patient_id not in self.access_controls or clinic_id not in self.access_controls[patient_id]:
            return None
        
        access = self.access_controls[patient_id][clinic_id]
        
        # Check expiration
        if access.expires_at and access.expires_at < datetime.utcnow():
            return None
        
        # Check category
        if category and category not in access.categories:
            return None
        
        return access

    async def get_access_log(
        self,
        patient_id: str,
        item_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get access log for patient data"""
        try:
            logs = []
            if patient_id in self.vault:
                if item_id:
                    if item_id in self.vault[patient_id]:
                        logs.extend(self.vault[patient_id][item_id].access_log)
                else:
                    for item in self.vault[patient_id].values():
                        logs.extend(item.access_log)
            
            return sorted(logs, key=lambda x: x["timestamp"])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get access log: {str(e)}")

    async def export_data(
        self,
        patient_id: str,
        format: str = "json"
    ) -> Dict[str, Any]:
        """Export patient data in specified format"""
        try:
            data = await self.retrieve_data(patient_id)
            
            if format == "json":
                return {
                    "patient_id": patient_id,
                    "exported_at": datetime.utcnow().isoformat(),
                    "data": data
                }
            else:
                raise ValueError(f"Unsupported format: {format}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")
