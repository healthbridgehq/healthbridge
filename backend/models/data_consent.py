from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import List

from .base import Base

class DataCategory(str, Enum):
    MEDICAL_HISTORY = "medical_history"
    TREATMENTS = "treatments"
    IMAGING = "imaging"
    PRESCRIPTIONS = "prescriptions"
    PATHOLOGY = "pathology"
    VITALS = "vitals"

class AccessLevel(str, Enum):
    FULL = "full"
    LIMITED = "limited"
    NONE = "none"

class DataConsent(Base):
    __tablename__ = "data_consents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    access_level = Column(Enum(AccessLevel), nullable=False, default=AccessLevel.NONE)
    valid_from = Column(DateTime, nullable=False, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)
    purposes = Column(JSON, nullable=False, default=list)  # List of approved purposes
    data_categories = Column(JSON, nullable=False)  # Dict of DataCategory: sharing_preference
    
    # Audit fields
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    last_modified_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="consents")
    clinic = relationship("Clinic", back_populates="patient_consents")
    audit_logs = relationship("ConsentAuditLog", back_populates="consent")
