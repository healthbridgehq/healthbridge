from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Table, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(enum.Enum):
    PATIENT = "patient"
    PRACTITIONER = "practitioner"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(Enum(UserRole))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    health_records = relationship("HealthRecord", back_populates="owner")
    consent_records = relationship("ConsentRecord", back_populates="user")
    practitioner = relationship("Practitioner", back_populates="user", uselist=False)

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    practitioners = relationship("Practitioner", back_populates="clinic")

class Practitioner(Base):
    __tablename__ = "practitioners"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    clinic_id = Column(String, ForeignKey("clinics.id"))
    specialty = Column(String)
    license_number = Column(String, unique=True)
    availability = Column(JSON)  # Store working hours and availability
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="practitioner")
    clinic = relationship("Clinic", back_populates="practitioners")
    health_records = relationship("HealthRecord", back_populates="practitioner")

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    practitioner_id = Column(String, ForeignKey("practitioners.id"))
    record_type = Column(String)  # e.g., "consultation", "lab_result", "prescription"
    content = Column(JSON)  # Encrypted FHIR-compliant health data
    encryption_metadata = Column(JSON)  # Store encryption details
    source = Column(String)  # Source system or provider
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="health_records")
    practitioner = relationship("Practitioner", back_populates="health_records")
    consent_records = relationship("ConsentRecord", back_populates="health_record")

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    health_record_id = Column(String, ForeignKey("health_records.id"))
    granted_to_id = Column(String, ForeignKey("users.id"))  # Can be practitioner or other user
    purpose = Column(String)
    access_level = Column(String)  # e.g., "read", "write", "admin"
    valid_from = Column(DateTime)
    valid_until = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="consent_records", foreign_keys=[user_id])
    health_record = relationship("HealthRecord", back_populates="consent_records")
    granted_to = relationship("User", foreign_keys=[granted_to_id])

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))  # Who performed the action
    action_type = Column(String)  # e.g., "view", "update", "delete"
    resource_type = Column(String)  # e.g., "health_record", "consent"
    resource_id = Column(String)  # ID of the accessed resource
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
    user_agent = Column(String)
    request_details = Column(JSON)  # Additional request metadata
    success = Column(Boolean)
    failure_reason = Column(String, nullable=True)

    user = relationship("User")
