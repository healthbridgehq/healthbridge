from pydantic import BaseSettings
from typing import Optional
from enum import Enum

class MHREnvironment(str, Enum):
    DEVELOPMENT = "development"  # For local development
    CONFORMANCE = "conformance"  # For testing and certification
    PRODUCTION = "production"    # For live system

class MHRConfig(BaseSettings):
    """Configuration for My Health Record integration."""
    
    # Environment settings
    environment: MHREnvironment = MHREnvironment.DEVELOPMENT
    base_url: str = "https://b2b.digitalhealth.gov.au/mhr/api/v1"
    
    # Authentication
    client_id: str
    client_secret: str
    
    # NASH PKI Certificate details
    nash_certificate_path: Optional[str] = None
    nash_private_key_path: Optional[str] = None
    
    # Encryption key for storing sensitive data
    encryption_key: str
    
    # Timeouts
    request_timeout: int = 30  # seconds
    token_expiry: int = 300   # seconds
    
    # Rate limiting
    max_requests_per_minute: int = 60
    
    # Document types enabled for sync
    enabled_document_types: list = [
        "SharedHealthSummary",
        "EventSummary",
        "PrescriptionRecord",
        "DispensingRecord",
        "PathologyReport",
        "DiagnosticImagingReport"
    ]
    
    # Compliance settings
    require_patient_consent: bool = True
    require_provider_consent: bool = True
    audit_all_access: bool = True
    
    class Config:
        env_prefix = "MHR_"
        case_sensitive = False
        
        # Environment variable examples:
        # MHR_ENVIRONMENT=production
        # MHR_CLIENT_ID=your-client-id
        # MHR_CLIENT_SECRET=your-client-secret
        # MHR_ENCRYPTION_KEY=your-encryption-key
