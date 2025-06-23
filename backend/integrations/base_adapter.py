from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class DataType(Enum):
    PATIENT = "patient"
    APPOINTMENT = "appointment"
    CLINICAL_NOTE = "clinical_note"
    PRESCRIPTION = "prescription"
    TEST_RESULT = "test_result"
    BILLING = "billing"
    DOCUMENT = "document"

class SyncDirection(Enum):
    PULL = "pull"
    PUSH = "push"
    BIDIRECTIONAL = "bidirectional"

class ConnectionStatus(Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    SYNCING = "syncing"

class SyncResult(BaseModel):
    success: bool
    data_type: DataType
    items_processed: int
    items_succeeded: int
    items_failed: int
    errors: List[Dict[str, Any]]
    timestamp: datetime
    duration_ms: int

class ClinicCredentials(BaseModel):
    api_key: str
    api_secret: Optional[str]
    client_id: Optional[str]
    client_secret: Optional[str]
    access_token: Optional[str]
    refresh_token: Optional[str]
    endpoint: str
    additional_params: Optional[Dict[str, Any]]

class BaseClinicAdapter(ABC):
    """Base adapter interface for clinic software integration"""

    def __init__(self, credentials: ClinicCredentials):
        self.credentials = credentials
        self.connection_status = ConnectionStatus.DISCONNECTED
        self.last_sync: Dict[DataType, datetime] = {}
        self.error_count = 0
        self.max_retries = 3

    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection to clinic software"""
        pass

    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from clinic software"""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test connection to clinic software"""
        pass

    @abstractmethod
    async def sync_data(
        self,
        data_type: DataType,
        direction: SyncDirection,
        since: Optional[datetime] = None
    ) -> SyncResult:
        """Sync data with clinic software"""
        pass

    @abstractmethod
    async def get_patient(self, patient_id: str) -> Dict[str, Any]:
        """Retrieve patient data"""
        pass

    @abstractmethod
    async def update_patient(self, patient_id: str, data: Dict[str, Any]) -> bool:
        """Update patient data"""
        pass

    @abstractmethod
    async def get_appointments(
        self,
        start_date: datetime,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve appointments"""
        pass

    @abstractmethod
    async def create_appointment(self, appointment_data: Dict[str, Any]) -> str:
        """Create new appointment"""
        pass

    @abstractmethod
    async def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> bool:
        """Update appointment"""
        pass

    @abstractmethod
    async def get_clinical_notes(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve clinical notes"""
        pass

    @abstractmethod
    async def create_clinical_note(
        self,
        patient_id: str,
        note_data: Dict[str, Any]
    ) -> str:
        """Create clinical note"""
        pass

    @abstractmethod
    async def get_prescriptions(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve prescriptions"""
        pass

    @abstractmethod
    async def create_prescription(
        self,
        patient_id: str,
        prescription_data: Dict[str, Any]
    ) -> str:
        """Create prescription"""
        pass

    @abstractmethod
    async def get_test_results(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve test results"""
        pass

    @abstractmethod
    async def upload_document(
        self,
        patient_id: str,
        document_data: Dict[str, Any],
        file_content: bytes
    ) -> str:
        """Upload document"""
        pass

    async def handle_webhook(self, event_type: str, payload: Dict[str, Any]) -> bool:
        """Handle webhook events from clinic software"""
        try:
            # Implement webhook handling logic
            return True
        except Exception as e:
            self.error_count += 1
            return False

    async def refresh_auth_token(self) -> bool:
        """Refresh authentication token"""
        try:
            # Implement token refresh logic
            return True
        except Exception as e:
            self.error_count += 1
            return False

    def get_status(self) -> Dict[str, Any]:
        """Get current adapter status"""
        return {
            "connection_status": self.connection_status,
            "last_sync": self.last_sync,
            "error_count": self.error_count
        }

    async def reset_error_count(self) -> None:
        """Reset error counter"""
        self.error_count = 0

    def _update_last_sync(self, data_type: DataType) -> None:
        """Update last sync timestamp"""
        self.last_sync[data_type] = datetime.utcnow()

    async def _handle_rate_limit(self, retry_after: int) -> None:
        """Handle rate limiting"""
        await asyncio.sleep(retry_after)

    def _validate_credentials(self) -> bool:
        """Validate adapter credentials"""
        required_fields = ["api_key", "endpoint"]
        return all(getattr(self.credentials, field) for field in required_fields)
