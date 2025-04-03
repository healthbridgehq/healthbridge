from pydantic import BaseSettings
from typing import List
from enum import Enum

class ClinikoEnvironment(str, Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"

class ClinikoConfig(BaseSettings):
    """Configuration for Cliniko integration."""
    
    # Environment settings
    environment: ClinikoEnvironment = ClinikoEnvironment.DEVELOPMENT
    
    # API settings
    api_version: str = "v1"
    user_agent: str = "HealthBridge Integration"
    
    # Sync settings
    sync_interval_minutes: int = 15
    sync_batch_size: int = 100
    max_sync_attempts: int = 3
    
    # Enabled data types for sync
    enabled_data_types: List[str] = [
        "patients",
        "appointments",
        "practitioners",
        "treatments",
        "invoices",
        "referrals",
        "bookings",
        "products"
    ]
    
    # Rate limiting (Cliniko's limits)
    max_requests_per_minute: int = 150
    
    # Timeouts
    request_timeout: int = 30  # seconds
    
    # Error handling
    retry_delay_seconds: int = 60
    max_retries: int = 3
    
    # Webhook settings (for real-time updates)
    webhook_secret: str = None
    webhook_events: List[str] = [
        "appointment.created",
        "appointment.updated",
        "appointment.cancelled",
        "patient.created",
        "patient.updated",
        "treatment_note.created",
        "treatment_note.updated"
    ]
    
    class Config:
        env_prefix = "CLINIKO_"
        case_sensitive = False
        
        # Environment variable examples:
        # CLINIKO_ENVIRONMENT=production
        # CLINIKO_SYNC_INTERVAL_MINUTES=15
        # CLINIKO_WEBHOOK_SECRET=your-webhook-secret
