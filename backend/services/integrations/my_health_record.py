from typing import Dict, Any, List, Optional
from datetime import datetime
import jwt
import aiohttp
from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.integration import Integration, IntegrationType, SyncStatus
from ..models.audit_log import AuditLog, ActionType, ResourceType
from ..config import MHRConfig

class MyHealthRecordService:
    """
    Service for integrating with Australia's My Health Record system.
    Implements the B2B Gateway specifications from the Australian Digital Health Agency.
    """
    
    def __init__(self, db_session: Session, config: MHRConfig):
        self.db = db_session
        self.config = config
        self.base_url = "https://b2b.digitalhealth.gov.au/mhr/api/v1"  # Production endpoint
        
    async def setup_integration(
        self,
        clinic_id: int,
        hpi_o: str,  # Healthcare Provider Identifier - Organisation
        hpi_i: str,  # Healthcare Provider Identifier - Individual
        nash_certificate: str,  # National Authentication Service for Health Certificate
        nash_private_key: str
    ) -> Integration:
        """
        Set up My Health Record integration for a clinic.
        
        Args:
            clinic_id: ID of the clinic
            hpi_o: Healthcare Provider Identifier - Organisation
            hpi_i: Healthcare Provider Identifier - Individual
            nash_certificate: NASH PKI Certificate
            nash_private_key: NASH PKI Private Key
        """
        # Validate HPI-O format
        if not self._validate_hpi_o(hpi_o):
            raise ValueError("Invalid HPI-O format")
            
        # Encrypt sensitive credentials before storage
        encrypted_credentials = self._encrypt_credentials({
            "hpi_o": hpi_o,
            "hpi_i": hpi_i,
            "nash_certificate": nash_certificate,
            "nash_private_key": nash_private_key
        })
        
        integration = Integration(
            clinic_id=clinic_id,
            integration_type=IntegrationType.MY_HEALTH_RECORD,
            credentials=encrypted_credentials,
            config={
                "api_version": "v1",
                "environment": self.config.environment,
                "enabled_document_types": [
                    "SharedHealthSummary",
                    "EventSummary",
                    "PrescriptionRecord",
                    "DispensingRecord",
                    "PathologyReport",
                    "DiagnosticImagingReport"
                ]
            },
            status=SyncStatus.PENDING
        )
        
        self.db.add(integration)
        await self.db.commit()
        await self.db.refresh(integration)
        
        return integration

    async def get_patient_mhr_documents(
        self,
        integration_id: int,
        ihi: str,  # Individual Healthcare Identifier
        document_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve patient documents from My Health Record.
        
        Args:
            integration_id: ID of the MHR integration
            ihi: Patient's Individual Healthcare Identifier
            document_types: Optional list of document types to retrieve
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        # Generate JWT for B2B authentication
        token = self._generate_mhr_jwt(
            hpi_o=credentials["hpi_o"],
            hpi_i=credentials["hpi_i"],
            nash_certificate=credentials["nash_certificate"],
            nash_private_key=credentials["nash_private_key"]
        )
        
        async with aiohttp.ClientSession() as session:
            # Get document list
            headers = {
                "Authorization": f"Bearer {token}",
                "X-Request-ID": str(uuid.uuid4()),
                "X-Provider-ID": credentials["hpi_o"],
                "X-Provider-Type": "HPI-O"
            }
            
            params = {"ihi": ihi}
            if document_types:
                params["document_types"] = ",".join(document_types)
                
            async with session.get(
                f"{self.base_url}/documents",
                headers=headers,
                params=params
            ) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to retrieve MHR documents"
                    )
                    
                documents = await response.json()
                
                # Log the access
                await self._log_mhr_access(
                    integration_id=integration_id,
                    ihi=ihi,
                    action="view",
                    details={
                        "document_types": document_types,
                        "document_count": len(documents)
                    }
                )
                
                return documents

    async def upload_document(
        self,
        integration_id: int,
        ihi: str,
        document_type: str,
        content: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Upload a clinical document to My Health Record.
        
        Args:
            integration_id: ID of the MHR integration
            ihi: Patient's Individual Healthcare Identifier
            document_type: Type of clinical document
            content: Document content in CDA format
            metadata: Document metadata
        """
        integration = await self._get_integration(integration_id)
        credentials = self._decrypt_credentials(integration.credentials)
        
        token = self._generate_mhr_jwt(
            hpi_o=credentials["hpi_o"],
            hpi_i=credentials["hpi_i"],
            nash_certificate=credentials["nash_certificate"],
            nash_private_key=credentials["nash_private_key"]
        )
        
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token}",
                "X-Request-ID": str(uuid.uuid4()),
                "X-Provider-ID": credentials["hpi_o"],
                "X-Provider-Type": "HPI-O",
                "Content-Type": "application/xml"
            }
            
            # Convert to CDA format
            cda_document = self._convert_to_cda(document_type, content, metadata)
            
            async with session.post(
                f"{self.base_url}/documents",
                headers=headers,
                json={
                    "ihi": ihi,
                    "document_type": document_type,
                    "content": cda_document,
                    "metadata": metadata
                }
            ) as response:
                if response.status != 201:
                    raise HTTPException(
                        status_code=response.status,
                        detail="Failed to upload document to MHR"
                    )
                    
                result = await response.json()
                
                # Log the upload
                await self._log_mhr_access(
                    integration_id=integration_id,
                    ihi=ihi,
                    action="upload",
                    details={
                        "document_type": document_type,
                        "document_id": result.get("document_id")
                    }
                )
                
                return result

    def _generate_mhr_jwt(
        self,
        hpi_o: str,
        hpi_i: str,
        nash_certificate: str,
        nash_private_key: str
    ) -> str:
        """Generate JWT for My Health Record B2B authentication."""
        now = datetime.utcnow()
        claims = {
            "iss": hpi_o,
            "sub": hpi_i,
            "aud": "https://b2b.digitalhealth.gov.au",
            "exp": now + timedelta(minutes=5),
            "iat": now,
            "jti": str(uuid.uuid4()),
            "hpi-o": hpi_o,
            "hpi-i": hpi_i
        }
        
        return jwt.encode(
            claims,
            nash_private_key,
            algorithm="RS256",
            headers={"x5c": [nash_certificate]}
        )

    def _convert_to_cda(
        self,
        document_type: str,
        content: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> str:
        """Convert document content to CDA (Clinical Document Architecture) format."""
        # Implementation would include CDA XML generation based on document type
        # This requires extensive HL7 CDA knowledge and compliance with Australian
        # Digital Health Agency specifications
        raise NotImplementedError("CDA conversion to be implemented")

    async def _log_mhr_access(
        self,
        integration_id: int,
        ihi: str,
        action: str,
        details: Dict[str, Any]
    ) -> None:
        """Log MHR access to audit trail."""
        await AuditLog.log_action(
            db_session=self.db,
            action=ActionType.VIEW if action == "view" else ActionType.CREATE,
            resource_type=ResourceType.HEALTH_RECORD,
            resource_id=integration_id,
            user_id=None,  # System action
            details={
                "integration_type": "my_health_record",
                "ihi": ihi,
                **details
            },
            ip_address="system"
        )

    @staticmethod
    def _validate_hpi_o(hpi_o: str) -> bool:
        """Validate Healthcare Provider Identifier - Organisation format."""
        # HPI-O format: 8 digits starting with 8
        return bool(re.match(r"^8\d{7}$", hpi_o))

    def _encrypt_credentials(self, credentials: Dict[str, str]) -> Dict[str, str]:
        """Encrypt sensitive credentials before storage."""
        # Implementation would use strong encryption (e.g., AES-256-GCM)
        # with proper key management
        raise NotImplementedError("Encryption to be implemented")

    def _decrypt_credentials(self, encrypted_credentials: Dict[str, str]) -> Dict[str, str]:
        """Decrypt stored credentials."""
        # Implementation would use corresponding decryption
        raise NotImplementedError("Decryption to be implemented")
