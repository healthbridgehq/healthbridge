from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.integration import Integration, IntegrationType, SyncStatus
from ..models.audit_log import AuditLog, ActionType, ResourceType
from ..config import ClinikoConfig

class ClinikoService:
    """
    Service for integrating with Cliniko practice management software.
    Implements the Cliniko API v1 specifications.
    """
    
    def __init__(self, db_session: Session, config: ClinikoConfig):
        self.db = db_session
        self.config = config
        
    async def setup_integration(
        self,
        clinic_id: int,
        api_key: str,
        subdomain: str
    ) -> Integration:
        """
        Set up Cliniko integration for a clinic.
        
        Args:
            clinic_id: ID of the clinic
            api_key: Cliniko API key
            subdomain: Cliniko subdomain
        """
        # Encrypt sensitive credentials
        encrypted_credentials = self._encrypt_credentials({
            "api_key": api_key,
            "subdomain": subdomain
        })
        
        integration = Integration(
            clinic_id=clinic_id,
            integration_type=IntegrationType.CLINIKO,
            credentials=encrypted_credentials,
            config={
                "sync_interval_minutes": 15,
                "enabled_data_types": [
                    "patients",
                    "appointments",
                    "practitioners",
                    "treatments",
                    "invoices",
                    "referrals"
                ]
            },
            status=SyncStatus.PENDING
        )
        
        self.db.add(integration)
        await self.db.commit()
        await self.db.refresh(integration)
        
        return integration

    async def sync_patients(
        self,
        integration_id: int,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize patient data from Cliniko.
        
        Args:
            integration_id: ID of the Cliniko integration
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "User-Agent": "HealthBridge Integration",
                "Authorization": f"Bearer {credentials['api_key']}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            
            params = {"page": 1, "per_page": 100}
            if last_sync:
                params["updated_at"] = last_sync.isoformat()
                
            base_url = f"https://{credentials['subdomain']}.cliniko.com/api/v1"
            
            async with session.get(
                f"{base_url}/patients",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync patients from Cliniko"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="patients",
                    record_count=len(data["patients"]),
                    success=True
                )
                
                return data

    async def sync_appointments(
        self,
        integration_id: int,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize appointment data from Cliniko.
        
        Args:
            integration_id: ID of the Cliniko integration
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "User-Agent": "HealthBridge Integration",
                "Authorization": f"Bearer {credentials['api_key']}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            
            params = {"page": 1, "per_page": 100}
            if last_sync:
                params["updated_at"] = last_sync.isoformat()
                
            base_url = f"https://{credentials['subdomain']}.cliniko.com/api/v1"
            
            async with session.get(
                f"{base_url}/appointments",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync appointments from Cliniko"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="appointments",
                    record_count=len(data["appointments"]),
                    success=True
                )
                
                return data

    async def sync_treatments(
        self,
        integration_id: int,
        patient_id: str,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize treatment notes for a patient.
        
        Args:
            integration_id: ID of the Cliniko integration
            patient_id: Cliniko patient ID
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "User-Agent": "HealthBridge Integration",
                "Authorization": f"Bearer {credentials['api_key']}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            
            params = {
                "page": 1,
                "per_page": 100,
                "patient_id": patient_id
            }
            if last_sync:
                params["updated_at"] = last_sync.isoformat()
                
            base_url = f"https://{credentials['subdomain']}.cliniko.com/api/v1"
            
            async with session.get(
                f"{base_url}/treatment_notes",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync treatments from Cliniko"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="treatments",
                    record_count=len(data["treatment_notes"]),
                    success=True,
                    details={"patient_id": patient_id}
                )
                
                return data

    async def sync_referrals(
        self,
        integration_id: int,
        patient_id: str,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize referral data for a patient.
        
        Args:
            integration_id: ID of the Cliniko integration
            patient_id: Cliniko patient ID
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "User-Agent": "HealthBridge Integration",
                "Authorization": f"Bearer {credentials['api_key']}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
            
            params = {
                "page": 1,
                "per_page": 100,
                "patient_id": patient_id
            }
            if last_sync:
                params["updated_at"] = last_sync.isoformat()
                
            base_url = f"https://{credentials['subdomain']}.cliniko.com/api/v1"
            
            async with session.get(
                f"{base_url}/referrals",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync referrals from Cliniko"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="referrals",
                    record_count=len(data["referrals"]),
                    success=True,
                    details={"patient_id": patient_id}
                )
                
                return data

    async def _log_sync(
        self,
        integration_id: int,
        data_type: str,
        record_count: int,
        success: bool,
        details: Dict[str, Any] = None
    ) -> None:
        """Log synchronization to audit trail."""
        await AuditLog.log_action(
            db_session=self.db,
            action=ActionType.SYNC,
            resource_type=ResourceType.INTEGRATION,
            resource_id=integration_id,
            details={
                "integration_type": "cliniko",
                "data_type": data_type,
                "record_count": record_count,
                "success": success,
                **(details or {})
            },
            success=success
        )

    async def _get_integration(self, integration_id: int) -> Integration:
        """Get integration by ID."""
        integration = await self.db.query(Integration).filter(
            Integration.id == integration_id,
            Integration.integration_type == IntegrationType.CLINIKO
        ).first()
        
        if not integration:
            raise HTTPException(
                status_code=404,
                detail="Cliniko integration not found"
            )
            
        return integration

    def _encrypt_credentials(self, credentials: Dict[str, str]) -> Dict[str, str]:
        """Encrypt sensitive credentials before storage."""
        # Implementation would use strong encryption (e.g., AES-256-GCM)
        # with proper key management
        raise NotImplementedError("Encryption to be implemented")

    def _decrypt_credentials(self, encrypted_credentials: Dict[str, str]) -> Dict[str, str]:
        """Decrypt stored credentials."""
        # Implementation would use corresponding decryption
        raise NotImplementedError("Decryption to be implemented")
