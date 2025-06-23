from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.integration import Integration, IntegrationType, SyncStatus
from ..models.audit_log import AuditLog, ActionType, ResourceType
from ..config import HealthEngineConfig

class HealthEngineService:
    """
    Service for integrating with HealthEngine booking platform.
    Implements the HealthEngine API specifications.
    """
    
    def __init__(self, db_session: Session, config: HealthEngineConfig):
        self.db = db_session
        self.config = config
        
    async def setup_integration(
        self,
        clinic_id: int,
        practice_id: str,
        api_key: str,
        api_secret: str
    ) -> Integration:
        """
        Set up HealthEngine integration for a clinic.
        
        Args:
            clinic_id: ID of the clinic
            practice_id: HealthEngine practice ID
            api_key: API key
            api_secret: API secret
        """
        # Encrypt sensitive credentials
        encrypted_credentials = self._encrypt_credentials({
            "practice_id": practice_id,
            "api_key": api_key,
            "api_secret": api_secret
        })
        
        integration = Integration(
            clinic_id=clinic_id,
            integration_type=IntegrationType.HEALTH_ENGINE,
            credentials=encrypted_credentials,
            config={
                "sync_interval_minutes": 5,  # More frequent for bookings
                "enabled_features": [
                    "online_bookings",
                    "practitioner_profiles",
                    "availability",
                    "patient_feedback",
                    "practice_profile"
                ]
            },
            status=SyncStatus.PENDING
        )
        
        self.db.add(integration)
        await self.db.commit()
        await self.db.refresh(integration)
        
        return integration

    async def sync_bookings(
        self,
        integration_id: int,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize booking data from HealthEngine.
        
        Args:
            integration_id: ID of the HealthEngine integration
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        # Generate auth token
        token = self._generate_auth_token(
            credentials["api_key"],
            credentials["api_secret"]
        )
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            params = {"practice_id": credentials["practice_id"]}
            if last_sync:
                params["modified_since"] = last_sync.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/bookings",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync bookings from HealthEngine"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="bookings",
                    record_count=len(data["bookings"]),
                    success=True
                )
                
                return data

    async def sync_availability(
        self,
        integration_id: int,
        practitioner_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Synchronize practitioner availability slots.
        
        Args:
            integration_id: ID of the HealthEngine integration
            practitioner_id: Optional specific practitioner
            start_date: Optional start date for availability
            end_date: Optional end date for availability
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        token = self._generate_auth_token(
            credentials["api_key"],
            credentials["api_secret"]
        )
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            params = {"practice_id": credentials["practice_id"]}
            if practitioner_id:
                params["practitioner_id"] = practitioner_id
            if start_date:
                params["start_date"] = start_date.isoformat()
            if end_date:
                params["end_date"] = end_date.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/availability",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to sync availability from HealthEngine"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="availability",
                    record_count=len(data["slots"]),
                    success=True,
                    details={"practitioner_id": practitioner_id} if practitioner_id else None
                )
                
                return data

    async def update_practitioner_profile(
        self,
        integration_id: int,
        practitioner_id: str,
        profile_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a practitioner's profile on HealthEngine.
        
        Args:
            integration_id: ID of the HealthEngine integration
            practitioner_id: HealthEngine practitioner ID
            profile_data: Profile data to update
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        token = self._generate_auth_token(
            credentials["api_key"],
            credentials["api_secret"]
        )
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            async with session.put(
                f"{self.config.api_base_url}/practitioners/{practitioner_id}",
                headers=headers,
                json={
                    "practice_id": credentials["practice_id"],
                    **profile_data
                }
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to update practitioner profile on HealthEngine"
                    )
                    
                data = await response.json()
                
                # Log the update
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="practitioner_profile",
                    record_count=1,
                    success=True,
                    details={"practitioner_id": practitioner_id}
                )
                
                return data

    async def get_patient_feedback(
        self,
        integration_id: int,
        last_sync: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Retrieve patient feedback and ratings.
        
        Args:
            integration_id: ID of the HealthEngine integration
            last_sync: Optional timestamp of last sync
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        token = self._generate_auth_token(
            credentials["api_key"],
            credentials["api_secret"]
        )
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            params = {"practice_id": credentials["practice_id"]}
            if last_sync:
                params["modified_since"] = last_sync.isoformat()
                
            async with session.get(
                f"{self.config.api_base_url}/feedback",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to retrieve patient feedback from HealthEngine"
                    )
                    
                data = await response.json()
                
                # Log the sync
                await self._log_sync(
                    integration_id=integration_id,
                    data_type="patient_feedback",
                    record_count=len(data["feedback"]),
                    success=True
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
                "integration_type": "health_engine",
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
            Integration.integration_type == IntegrationType.HEALTH_ENGINE
        ).first()
        
        if not integration:
            raise HTTPException(
                status_code=404,
                detail="HealthEngine integration not found"
            )
            
        return integration

    def _generate_auth_token(self, api_key: str, api_secret: str) -> str:
        """Generate authentication token for HealthEngine API."""
        # Implementation would use OAuth2 or similar
        raise NotImplementedError("Auth token generation to be implemented")

    def _encrypt_credentials(self, credentials: Dict[str, str]) -> Dict[str, str]:
        """Encrypt sensitive credentials before storage."""
        # Implementation would use strong encryption (e.g., AES-256-GCM)
        # with proper key management
        raise NotImplementedError("Encryption to be implemented")

    def _decrypt_credentials(self, encrypted_credentials: Dict[str, str]) -> Dict[str, str]:
        """Decrypt stored credentials."""
        # Implementation would use corresponding decryption
        raise NotImplementedError("Decryption to be implemented")
