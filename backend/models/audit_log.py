from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any

from .base import Base

class ActionType(str, Enum):
    VIEW = "view"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    GRANT = "grant"
    REVOKE = "revoke"
    EXPORT = "export"
    SYNC = "sync"

class ResourceType(str, Enum):
    HEALTH_RECORD = "health_record"
    CONSENT = "consent"
    INTEGRATION = "integration"
    USER_PROFILE = "user_profile"
    DATA_EXPORT = "data_export"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    action = Column(Enum(ActionType), nullable=False)
    resource_type = Column(Enum(ResourceType), nullable=False)
    resource_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True)
    
    # Details about the action
    details = Column(JSON, nullable=False, default=dict)
    
    # IP address and user agent for security tracking
    ip_address = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    
    # Success/failure status and any error messages
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(String, nullable=True)
    
    # If this was an authorized access through a consent
    consent_id = Column(Integer, ForeignKey("data_consents.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    clinic = relationship("Clinic", back_populates="audit_logs")
    consent = relationship("DataConsent", back_populates="audit_logs")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.timestamp = datetime.utcnow()

    @classmethod
    def log_action(
        cls,
        db_session,
        action: ActionType,
        resource_type: ResourceType,
        resource_id: int,
        user_id: int,
        ip_address: str,
        details: Dict[str, Any],
        clinic_id: int = None,
        user_agent: str = None,
        consent_id: int = None,
        success: bool = True,
        error_message: str = None
    ) -> "AuditLog":
        """
        Create and save an audit log entry.
        
        Args:
            db_session: SQLAlchemy session
            action: Type of action performed
            resource_type: Type of resource being accessed
            resource_id: ID of the resource
            user_id: ID of the user performing the action
            ip_address: IP address of the request
            details: Additional details about the action
            clinic_id: Optional ID of the clinic involved
            user_agent: Optional user agent string
            consent_id: Optional ID of the consent that authorized this action
            success: Whether the action was successful
            error_message: Optional error message if the action failed
        
        Returns:
            AuditLog: The created audit log entry
        """
        log = cls(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id,
            clinic_id=clinic_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
            consent_id=consent_id,
            success=success,
            error_message=error_message
        )
        
        db_session.add(log)
        db_session.commit()
        
        return log
