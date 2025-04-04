from pydantic import BaseSettings
from typing import List
from enum import Enum

class HealthEngineEnvironment(str, Enum):
    SANDBOX = "sandbox"
    PRODUCTION = "production"

class HealthEngineConfig(BaseSettings):
    """Configuration for HealthEngine integration."""
    
    # Environment settings
    environment: HealthEngineEnvironment = HealthEngineEnvironment.SANDBOX
    api_base_url: str = "https://api.healthengine.com.au/v3"  # or sandbox URL
    
    # API settings
    api_version: str = "v3"
    
    # Sync settings
    sync_interval_minutes: int = 5  # More frequent for bookings
    sync_batch_size: int = 50
    max_sync_attempts: int = 3
    
    # Enabled features
    enabled_features: List[str] = [
        "online_bookings",
        "practitioner_profiles",
        "availability",
        "patient_feedback",
        "practice_profile",
        "telehealth",
        "recalls"
    ]
    
    # Booking settings
    default_appointment_length: int = 15  # minutes
    max_future_booking_days: int = 90
    allow_recurring_bookings: bool = True
    
    # Rate limiting
    max_requests_per_minute: int = 100
    
    # Timeouts
    request_timeout: int = 30  # seconds
    
    # Error handling
    retry_delay_seconds: int = 60
    max_retries: int = 3
    
    # Webhook settings
    webhook_secret: str = None
    webhook_events: List[str] = [
        "booking.created",
        "booking.updated",
        "booking.cancelled",
        "feedback.created",
        "availability.updated"
    ]
    
    class Config:
        env_prefix = "HEALTH_ENGINE_"
        case_sensitive = False
        
        # Environment variable examples:
        # HEALTH_ENGINE_ENVIRONMENT=production
        # HEALTH_ENGINE_API_BASE_URL=https://api.healthengine.com.au/v3
        # HEALTH_ENGINE_WEBHOOK_SECRET=your-webhook-secret
