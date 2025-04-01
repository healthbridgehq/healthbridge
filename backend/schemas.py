from pydantic import BaseModel, EmailStr, ConfigDict, UUID4
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

from .models import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID4
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ClinicBase(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class ClinicCreate(ClinicBase):
    pass

class Clinic(ClinicBase):
    id: UUID4
    is_active: bool
    created_at: datetime
    updated_at: datetime
    practitioners: List['Practitioner'] = []

    model_config = ConfigDict(from_attributes=True)

class PractitionerBase(BaseModel):
    specialty: str
    license_number: str
    availability: Dict[str, Any]

class PractitionerCreate(PractitionerBase):
    user_id: UUID4
    clinic_id: UUID4

class Practitioner(PractitionerBase):
    id: UUID4
    user_id: UUID4
    clinic_id: UUID4
    is_active: bool
    created_at: datetime
    updated_at: datetime
    user: User
    clinic: Clinic

    model_config = ConfigDict(from_attributes=True)

class HealthRecordBase(BaseModel):
    record_type: str
    content: Dict[str, Any]
    encryption_metadata: Dict[str, Any]
    source: str

class HealthRecordCreate(HealthRecordBase):
    user_id: UUID4
    practitioner_id: UUID4

class HealthRecord(HealthRecordBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    owner: User
    practitioner: Practitioner

    model_config = ConfigDict(from_attributes=True)

class ConsentRecordBase(BaseModel):
    health_record_id: UUID4
    granted_to_id: UUID4
    purpose: str
    access_level: str
    valid_from: datetime
    valid_until: Optional[datetime] = None

class ConsentRecordCreate(ConsentRecordBase):
    user_id: UUID4

class ConsentRecord(ConsentRecordBase):
    id: UUID4
    is_active: bool
    created_at: datetime
    updated_at: datetime
    user: User
    health_record: HealthRecord
    granted_to: User

    model_config = ConfigDict(from_attributes=True)

class AuditLogBase(BaseModel):
    action_type: str
    resource_type: str
    resource_id: UUID4
    ip_address: str
    user_agent: str
    request_details: Dict[str, Any]
    success: bool
    failure_reason: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: UUID4

class AuditLog(AuditLogBase):
    id: UUID4
    timestamp: datetime
    user: User

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[User] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

    model_config = ConfigDict(from_attributes=True)
