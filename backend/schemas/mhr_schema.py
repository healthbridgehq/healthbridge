from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class MHRDocumentType(str, Enum):
    SHARED_HEALTH_SUMMARY = "SharedHealthSummary"
    EVENT_SUMMARY = "EventSummary"
    PRESCRIPTION_RECORD = "PrescriptionRecord"
    DISPENSING_RECORD = "DispensingRecord"
    PATHOLOGY_REPORT = "PathologyReport"
    DIAGNOSTIC_IMAGING = "DiagnosticImagingReport"
    DISCHARGE_SUMMARY = "DischargeSummary"
    SPECIALIST_LETTER = "SpecialistLetter"

class MHRAccessType(str, Enum):
    NORMAL = "normal"              # Standard access
    EMERGENCY = "emergency"        # Break-glass emergency access
    RESTRICTED = "restricted"      # Limited to specific document types
    WITHDRAWN = "withdrawn"        # Patient has withdrawn access

class MHRDocumentMetadata(BaseModel):
    """Metadata for My Health Record documents."""
    
    document_id: str = Field(..., description="Unique identifier for the document")
    document_type: MHRDocumentType
    created_at: datetime
    author: Dict[str, str] = Field(..., description="Author details including HPI-I")
    organization: Dict[str, str] = Field(..., description="Organization details including HPI-O")
    patient_ihi: str = Field(..., description="Individual Healthcare Identifier")
    version: str
    status: str = Field(default="active")
    confidentiality: str = Field(default="normal")
    
    class Config:
        schema_extra = {
            "example": {
                "document_id": "1.2.36.1.2001.1003.0.8003621566684455",
                "document_type": "SharedHealthSummary",
                "created_at": "2025-04-02T09:30:00Z",
                "author": {
                    "hpi_i": "8003610000000000",
                    "name": "Dr Jane Smith",
                    "role": "General Practitioner"
                },
                "organization": {
                    "hpi_o": "8003620000000000",
                    "name": "City Medical Centre"
                },
                "patient_ihi": "8003640000000000",
                "version": "1.0",
                "status": "active",
                "confidentiality": "normal"
            }
        }

class MHRAccessControl(BaseModel):
    """Access control settings for My Health Record."""
    
    ihi: str = Field(..., description="Patient's Individual Healthcare Identifier")
    access_type: MHRAccessType = Field(default=MHRAccessType.NORMAL)
    restricted_document_types: Optional[List[MHRDocumentType]] = None
    restricted_providers: Optional[List[str]] = None  # List of HPI-I/HPI-O
    emergency_access_code: Optional[str] = None
    access_history_enabled: bool = Field(default=True)
    
    class Config:
        schema_extra = {
            "example": {
                "ihi": "8003640000000000",
                "access_type": "restricted",
                "restricted_document_types": [
                    "SharedHealthSummary",
                    "PrescriptionRecord"
                ],
                "restricted_providers": ["8003610000000000"],
                "access_history_enabled": True
            }
        }

class MHRDocument(BaseModel):
    """Complete My Health Record document."""
    
    metadata: MHRDocumentMetadata
    content: Dict[str, Any] = Field(..., description="CDA formatted document content")
    access_control: Optional[MHRAccessControl] = None
    
    class Config:
        schema_extra = {
            "example": {
                "metadata": {
                    "document_id": "1.2.36.1.2001.1003.0.8003621566684455",
                    "document_type": "SharedHealthSummary",
                    "created_at": "2025-04-02T09:30:00Z",
                    "author": {
                        "hpi_i": "8003610000000000",
                        "name": "Dr Jane Smith",
                        "role": "General Practitioner"
                    },
                    "organization": {
                        "hpi_o": "8003620000000000",
                        "name": "City Medical Centre"
                    },
                    "patient_ihi": "8003640000000000",
                    "version": "1.0",
                    "status": "active",
                    "confidentiality": "normal"
                },
                "content": {
                    "clinical_synopsis": "Patient presents with...",
                    "medications": [],
                    "allergies": [],
                    "conditions": []
                },
                "access_control": {
                    "ihi": "8003640000000000",
                    "access_type": "normal",
                    "access_history_enabled": True
                }
            }
        }
