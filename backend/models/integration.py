from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any, List

from .base import Base

class IntegrationType(str, Enum):
    MY_HEALTH_RECORD = "my_health_record"  # Australian national health record system
    BEST_PRACTICE = "best_practice"        # Medical practice management software
    CLINIKO = "cliniko"                   # Allied health practice management
    HEALTH_ENGINE = "health_engine"       # Patient booking and engagement platform

class SyncStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    ERROR = "error"
    DISABLED = "disabled"

class DataDirection(str, Enum):
    IMPORT = "import"
    EXPORT = "export"
    BIDIRECTIONAL = "bidirectional"

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    integration_type = Column(Enum(IntegrationType), nullable=False)
    
    # Connection details (encrypted)
    credentials = Column(JSON, nullable=True)  # Stored encrypted
    config = Column(JSON, nullable=False, default=dict)
    
    # Status
    status = Column(Enum(SyncStatus), nullable=False, default=SyncStatus.PENDING)
    last_sync = Column(DateTime, nullable=True)
    next_sync = Column(DateTime, nullable=True)
    
    # Data flow configuration
    data_direction = Column(Enum(DataDirection), nullable=False, default=DataDirection.IMPORT)
    enabled_data_types = Column(JSON, nullable=False, default=list)  # List of enabled data types
    
    # Error tracking
    last_error = Column(String, nullable=True)
    error_count = Column(Integer, nullable=False, default=0)
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    clinic = relationship("Clinic", back_populates="integrations")
    sync_logs = relationship("IntegrationSyncLog", back_populates="integration")

    @property
    def is_healthy(self) -> bool:
        """Check if the integration is healthy based on error count and status."""
        return (
            self.status == SyncStatus.ACTIVE and
            self.error_count < 3 and
            (
                self.last_sync is None or
                (datetime.utcnow() - self.last_sync).total_seconds() < 86400  # Within 24 hours
            )
        )

    def update_sync_status(
        self,
        db_session,
        success: bool,
        error_message: str = None,
        sync_details: Dict[str, Any] = None
    ) -> None:
        """
        Update the integration's sync status and create a sync log entry.
        
        Args:
            db_session: SQLAlchemy session
            success: Whether the sync was successful
            error_message: Optional error message if sync failed
            sync_details: Optional details about the sync operation
        """
        now = datetime.utcnow()
        
        if success:
            self.status = SyncStatus.ACTIVE
            self.error_count = 0
            self.last_error = None
        else:
            self.error_count += 1
            self.last_error = error_message
            if self.error_count >= 3:
                self.status = SyncStatus.ERROR
        
        self.last_sync = now
        self.next_sync = now + timedelta(hours=1)  # Schedule next sync
        
        # Create sync log
        sync_log = IntegrationSyncLog(
            integration_id=self.id,
            success=success,
            error_message=error_message,
            details=sync_details or {}
        )
        
        db_session.add(sync_log)
        db_session.commit()

class IntegrationSyncLog(Base):
    __tablename__ = "integration_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    success = Column(Boolean, nullable=False)
    error_message = Column(String, nullable=True)
    details = Column(JSON, nullable=False, default=dict)
    
    # Relationship
    integration = relationship("Integration", back_populates="sync_logs")
