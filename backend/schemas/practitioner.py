from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PractitionerBase(BaseModel):
    specialty: str
    license_number: str
    clinic_id: int
    is_active: Optional[bool] = True

class PractitionerCreate(PractitionerBase):
    user_id: int

class Practitioner(PractitionerBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
