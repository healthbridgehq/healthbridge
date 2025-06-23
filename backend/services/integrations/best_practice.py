from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.integration import Integration, IntegrationType, SyncStatus
from ..models.audit_log import AuditLog, ActionType, ResourceType
from ..config import BestPracticeConfig

class BestPracticeService:
    """
    Service for integrating with Best Practice clinical software.
    Implements the Best Practice API specifications for data synchronization.
    """
    
    def __init__(self, db_session: Session, config: BestPracticeConfig):
        self.db = db_session
        self.config = config
        
    async def setup_integration(
        self,
        clinic_id: int,
        bp_site_id: str,
        api_key: str,
        database_path: str
    ) -> Integration:
        """
        Set up Best Practice integration for a clinic.
        
        Args:
            clinic_id: ID of the clinic
            bp_site_id: Best Practice site identifier
            api_key: API key for Best Practice API
            database_path: Path to Best Practice database
        """
        # Encrypt sensitive credentials
        encrypted_credentials = self._encrypt_credentials({
            "bp_site_id": bp_site_id,
            "api_key": api_key,
            "database_path": database_path
        })
        
        integration = Integration(
            clinic_id=clinic_id,
            integration_type=IntegrationType.BEST_PRACTICE,
            credentials=encrypted_credentials,
            config={
                "sync_interval_minutes": 15,
                "enabled_data_types": [
                    "patients",
                    "appointments",
                    "clinical_notes",
                    "prescriptions",
                    "pathology",
                    "imaging",
                    "immunisations"
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
        Synchronize patient data from Best Practice.
        
        Args:
            integration_id: ID of the Best Practice integration
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "X-BP-Site-ID": credentials["bp_site_id"],
                "X-API-Key": credentials["api_key"],
                "Content-Type": "application/json"
            }
            
            params = {}
            if last_sync:
                params["modified_since"] = last_sync.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/patients",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync patients from Best Practice"
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

    async def sync_clinical_notes(
        self,
        integration_id: int,
        patient_id: str,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize clinical notes for a patient.
        
        Args:
            integration_id: ID of the Best Practice integration
            patient_id: Best Practice patient ID
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "X-BP-Site-ID": credentials["bp_site_id"],
                "X-API-Key": credentials["api_key"],
                "Content-Type": "application/json"
            }
            
            params = {"patient_id": patient_id}
            if last_sync:
                params["modified_since"] = last_sync.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/clinical-notes",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync clinical notes from Best Practice"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="clinical_notes",
                    record_count=len(data["notes"]),
                    success=True,
                    details={"patient_id": patient_id}
                )
                
                return data

    async def sync_prescriptions(
        self,
        integration_id: int,
        patient_id: str,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize prescription data for a patient.
        
        Args:
            integration_id: ID of the Best Practice integration
            patient_id: Best Practice patient ID
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "X-BP-Site-ID": credentials["bp_site_id"],
                "X-API-Key": credentials["api_key"],
                "Content-Type": "application/json"
            }
            
            params = {"patient_id": patient_id}
            if last_sync:
                params["modified_since"] = last_sync.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/prescriptions",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync prescriptions from Best Practice"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="prescriptions",
                    record_count=len(data["prescriptions"]),
                    success=True,
                    details={"patient_id": patient_id}
                )
                
                return data

    async def sync_pathology(
        self,
        integration_id: int,
        patient_id: str,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize pathology results for a patient.
        
        Args:
            integration_id: ID of the Best Practice integration
            patient_id: Best Practice patient ID
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "X-BP-Site-ID": credentials["bp_site_id"],
                "X-API-Key": credentials["api_key"],
                "Content-Type": "application/json"
            }
            
            params = {"patient_id": patient_id}
            if last_sync:
                params["modified_since"] = last_sync.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/pathology",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync pathology results from Best Practice"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="pathology",
                    record_count=len(data["results"]),
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
                "integration_type": "best_practice",
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
            Integration.integration_type == IntegrationType.BEST_PRACTICE
        ).first()
        
        if not integration:
            raise HTTPException(
                status_code=404,
                detail="Best Practice integration not found"
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
