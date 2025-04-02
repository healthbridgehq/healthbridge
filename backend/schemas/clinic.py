from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ClinicBase(BaseModel):
    name: str
    address: str
    phone: str
    is_active: Optional[bool] = True

class ClinicCreate(ClinicBase):
    pass

class Clinic(ClinicBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
