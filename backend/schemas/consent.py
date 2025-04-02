from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConsentRecordBase(BaseModel):
    data_type: str
    purpose: str
    third_party: Optional[str] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = True

class ConsentRecordCreate(ConsentRecordBase):
    pass

class ConsentRecord(ConsentRecordBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
