from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from database import get_db
from models.user import User
from models.consent import ConsentRecord
from models.health_record import HealthRecord
from schemas.consent import ConsentRecordCreate, ConsentRecord as ConsentRecordSchema
from security import get_current_user

router = APIRouter()

@router.get("/policy")
async def get_privacy_policy():
    """
    Get the current privacy policy.
    """
    return {
        "version": "1.0.0",
        "last_updated": "2025-04-01",
        "policy": {
            "data_collection": {
                "personal_data": [
                    "Full name",
                    "Email address",
                    "Health records",
                    "Medical history"
                ],
                "purpose": "Healthcare service provision and improvement",
                "legal_basis": "Explicit consent and medical necessity"
            },
            "data_processing": {
                "storage_location": "Australia",
                "retention_period": "7 years after last interaction",
                "encryption": "AES-256 for data at rest, TLS 1.3 for transit"
            },
            "data_sharing": {
                "recipients": [
                    "Treating healthcare providers",
                    "Emergency services (when necessary)"
                ],
                "third_party_transfers": "Only with explicit consent",
                "international_transfers": "None"
            },
            "user_rights": {
                "access": "Full access to personal data",
                "rectification": "Right to correct inaccurate data",
                "erasure": "Right to request data deletion",
                "portability": "Right to receive data in machine-readable format"
            },
            "compliance": {
                "gdpr": "Full compliance",
                "my_health_records": "Compliant with Australian My Health Record system",
                "privacy_act": "Compliant with Australian Privacy Principles"
            }
        }
    }

@router.post("/consent", response_model=ConsentRecordSchema)
async def create_consent_record(
    *,
    db: Session = Depends(get_db),
    consent_in: ConsentRecordCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new consent record for data sharing.
    """
    # Verify the health record exists and belongs to the user
    health_record = db.query(HealthRecord).filter(
        HealthRecord.id == consent_in.health_record_id,
        HealthRecord.user_id == current_user.id
    ).first()
    
    if not health_record:
        raise HTTPException(
            status_code=404,
            detail="Health record not found or access denied"
        )
    
    # Create consent record
    consent = ConsentRecord(
        **consent_in.model_dump(),
        user_id=current_user.id,
        is_active=True
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    
    return consent

@router.get("/consent/active", response_model=List[ConsentRecordSchema])
async def get_active_consents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all active consent records for the current user.
    """
    return db.query(ConsentRecord).filter(
        ConsentRecord.user_id == current_user.id,
        ConsentRecord.is_active == True,
        ConsentRecord.valid_until > datetime.utcnow()
    ).all()

@router.delete("/consent/{consent_id}")
async def revoke_consent(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Revoke a consent record.
    """
    consent = db.query(ConsentRecord).filter(
        ConsentRecord.id == consent_id,
        ConsentRecord.user_id == current_user.id
    ).first()
    
    if not consent:
        raise HTTPException(
            status_code=404,
            detail="Consent record not found or access denied"
        )
    
    consent.is_active = False
    consent.valid_until = datetime.utcnow()
    db.commit()
    
    return {"status": "success", "message": "Consent revoked successfully"}
