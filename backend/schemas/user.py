from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"  # Default to user role

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime]
    role: UserRole = UserRole.USER

    class Config:
        from_attributes = True
        json_encoders = {
            UserRole: lambda v: v.value
        }

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole

    class Config:
        from_attributes = True
        json_encoders = {
            UserRole: lambda v: v.value
        }

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        from_attributes = True
        json_encoders = {
            UserRole: lambda v: v.value
        }

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None
