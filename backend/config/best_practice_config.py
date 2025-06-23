from pydantic import BaseSettings
from typing import List
from enum import Enum

class BPEnvironment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class BestPracticeConfig(BaseSettings):
    """Configuration for Best Practice integration."""
    
    # Environment settings
    environment: BPEnvironment = BPEnvironment.DEVELOPMENT
    api_base_url: str = "https://api.bpsoftware.net/v1"
    
    # Authentication
    api_key_prefix: str = "bp_live_"  # or "bp_test_" for staging
    
    # Database connection (for direct database access if needed)
    database_driver: str = "ODBC Driver 17 for SQL Server"
    
    # Sync settings
    sync_interval_minutes: int = 15
    sync_batch_size: int = 100
    max_sync_attempts: int = 3
    
    # Enabled data types for sync
    enabled_data_types: List[str] = [
        "patients",
        "appointments",
        "clinical_notes",
        "prescriptions",
        "pathology",
        "imaging",
        "immunisations",
        "allergies",
        "conditions"
    ]
    
    # Rate limiting
    max_requests_per_minute: int = 60
    
    # Timeouts
    request_timeout: int = 30  # seconds
    
    # Error handling
    retry_delay_seconds: int = 60
    max_retries: int = 3
    
    class Config:
        env_prefix = "BP_"
        case_sensitive = False
        
        # Environment variable examples:
        # BP_ENVIRONMENT=production
        # BP_API_KEY_PREFIX=bp_live_
        # BP_SYNC_INTERVAL_MINUTES=15
