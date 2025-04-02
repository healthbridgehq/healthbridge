from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from enum import Enum as PyEnum

class UserRole(str, PyEnum):
    USER = "user"
    PRACTITIONER = "practitioner"
    ADMIN = "admin"
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from models.health_record import HealthRecord
from models.consent import ConsentRecord
from models.practitioner import Practitioner

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, default=UserRole.USER.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    health_records = relationship("HealthRecord", back_populates="user")
    consent_records = relationship("ConsentRecord", back_populates="user")
    practitioner = relationship("Practitioner", back_populates="user", uselist=False)
