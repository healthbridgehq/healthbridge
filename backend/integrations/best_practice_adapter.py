import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
import json
from base64 import b64encode
from .base_adapter import (
    BaseClinicAdapter,
    DataType,
    SyncDirection,
    ConnectionStatus,
    SyncResult,
    ClinicCredentials
)

class BestPracticeError(Exception):
    """Custom error for Best Practice API issues"""
    pass

class BestPracticeAdapter(BaseClinicAdapter):
    """Adapter for Best Practice clinic software"""

    def __init__(self, credentials: ClinicCredentials):
        super().__init__(credentials)
        self.session: Optional[aiohttp.ClientSession] = None
        self.token_expires_at: Optional[datetime] = None
        self.api_version = "v2"  # Best Practice API version

    async def connect(self) -> bool:
        """Establish connection to Best Practice"""
        try:
            if not self._validate_credentials():
                raise BestPracticeError("Invalid credentials")

            self.session = aiohttp.ClientSession(
                base_url=self.credentials.endpoint,
                headers=self._get_default_headers()
            )

            # Test connection and get initial token
            await self.refresh_auth_token()
            self.connection_status = ConnectionStatus.CONNECTED
            return True
        except Exception as e:
            self.connection_status = ConnectionStatus.ERROR
            raise BestPracticeError(f"Connection failed: {str(e)}")

    async def disconnect(self) -> bool:
        """Disconnect from Best Practice"""
        try:
            if self.session:
                await self.session.close()
            self.connection_status = ConnectionStatus.DISCONNECTED
            return True
        except Exception as e:
            self.error_count += 1
            return False

    async def test_connection(self) -> bool:
        """Test connection to Best Practice"""
        try:
            if not self.session:
                await self.connect()
            
            async with self.session.get("/api/health") as response:
                return response.status == 200
        except Exception:
            return False

    async def sync_data(
        self,
        data_type: DataType,
        direction: SyncDirection,
        since: Optional[datetime] = None
    ) -> SyncResult:
        """Sync data with Best Practice"""
        try:
            self.connection_status = ConnectionStatus.SYNCING
            start_time = datetime.utcnow()
            
            # Get appropriate sync method based on data type
            sync_method = self._get_sync_method(data_type, direction)
            if not sync_method:
                raise BestPracticeError(f"Unsupported data type: {data_type}")
            
            # Execute sync
            result = await sync_method(since)
            
            # Update sync timestamp
            self._update_last_sync(data_type)
            
            end_time = datetime.utcnow()
            duration_ms = int((end_time - start_time).total_seconds() * 1000)
            
            self.connection_status = ConnectionStatus.CONNECTED
            
            return SyncResult(
                success=True,
                data_type=data_type,
                items_processed=result["processed"],
                items_succeeded=result["succeeded"],
                items_failed=result["failed"],
                errors=result["errors"],
                timestamp=end_time,
                duration_ms=duration_ms
            )
        except Exception as e:
            self.error_count += 1
            self.connection_status = ConnectionStatus.ERROR
            raise BestPracticeError(f"Sync failed: {str(e)}")

    async def get_patient(self, patient_id: str) -> Dict[str, Any]:
        """Retrieve patient data from Best Practice"""
        try:
            async with self.session.get(f"/api/{self.api_version}/patients/{patient_id}") as response:
                if response.status == 404:
                    raise BestPracticeError("Patient not found")
                elif response.status != 200:
                    raise BestPracticeError(f"Failed to get patient: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to get patient: {str(e)}")

    async def update_patient(self, patient_id: str, data: Dict[str, Any]) -> bool:
        """Update patient data in Best Practice"""
        try:
            async with self.session.put(
                f"/api/{self.api_version}/patients/{patient_id}",
                json=data
            ) as response:
                return response.status == 200
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to update patient: {str(e)}")

    async def get_appointments(
        self,
        start_date: datetime,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve appointments from Best Practice"""
        try:
            params = {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat() if end_date else None
            }
            
            async with self.session.get(
                f"/api/{self.api_version}/appointments",
                params=params
            ) as response:
                if response.status != 200:
                    raise BestPracticeError(f"Failed to get appointments: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to get appointments: {str(e)}")

    async def create_appointment(self, appointment_data: Dict[str, Any]) -> str:
        """Create new appointment in Best Practice"""
        try:
            async with self.session.post(
                f"/api/{self.api_version}/appointments",
                json=appointment_data
            ) as response:
                if response.status != 201:
                    raise BestPracticeError(f"Failed to create appointment: {response.status}")
                
                result = await response.json()
                return result["appointment_id"]
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to create appointment: {str(e)}")

    async def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> bool:
        """Update appointment in Best Practice"""
        try:
            async with self.session.put(
                f"/api/{self.api_version}/appointments/{appointment_id}",
                json=data
            ) as response:
                return response.status == 200
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to update appointment: {str(e)}")

    async def get_clinical_notes(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve clinical notes from Best Practice"""
        try:
            params = {"since": since.isoformat()} if since else {}
            
            async with self.session.get(
                f"/api/{self.api_version}/patients/{patient_id}/clinical-notes",
                params=params
            ) as response:
                if response.status != 200:
                    raise BestPracticeError(f"Failed to get clinical notes: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to get clinical notes: {str(e)}")

    async def create_clinical_note(
        self,
        patient_id: str,
        note_data: Dict[str, Any]
    ) -> str:
        """Create clinical note in Best Practice"""
        try:
            async with self.session.post(
                f"/api/{self.api_version}/patients/{patient_id}/clinical-notes",
                json=note_data
            ) as response:
                if response.status != 201:
                    raise BestPracticeError(f"Failed to create clinical note: {response.status}")
                
                result = await response.json()
                return result["note_id"]
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to create clinical note: {str(e)}")

    async def get_prescriptions(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve prescriptions from Best Practice"""
        try:
            params = {"since": since.isoformat()} if since else {}
            
            async with self.session.get(
                f"/api/{self.api_version}/patients/{patient_id}/prescriptions",
                params=params
            ) as response:
                if response.status != 200:
                    raise BestPracticeError(f"Failed to get prescriptions: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to get prescriptions: {str(e)}")

    async def create_prescription(
        self,
        patient_id: str,
        prescription_data: Dict[str, Any]
    ) -> str:
        """Create prescription in Best Practice"""
        try:
            async with self.session.post(
                f"/api/{self.api_version}/patients/{patient_id}/prescriptions",
                json=prescription_data
            ) as response:
                if response.status != 201:
                    raise BestPracticeError(f"Failed to create prescription: {response.status}")
                
                result = await response.json()
                return result["prescription_id"]
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to create prescription: {str(e)}")

    async def get_test_results(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve test results from Best Practice"""
        try:
            params = {"since": since.isoformat()} if since else {}
            
            async with self.session.get(
                f"/api/{self.api_version}/patients/{patient_id}/test-results",
                params=params
            ) as response:
                if response.status != 200:
                    raise BestPracticeError(f"Failed to get test results: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to get test results: {str(e)}")

    async def upload_document(
        self,
        patient_id: str,
        document_data: Dict[str, Any],
        file_content: bytes
    ) -> str:
        """Upload document to Best Practice"""
        try:
            # Create multipart form data
            form = aiohttp.FormData()
            form.add_field(
                "metadata",
                json.dumps(document_data),
                content_type="application/json"
            )
            form.add_field(
                "file",
                file_content,
                filename=document_data.get("filename", "document.pdf")
            )
            
            async with self.session.post(
                f"/api/{self.api_version}/patients/{patient_id}/documents",
                data=form
            ) as response:
                if response.status != 201:
                    raise BestPracticeError(f"Failed to upload document: {response.status}")
                
                result = await response.json()
                return result["document_id"]
        except Exception as e:
            self.error_count += 1
            raise BestPracticeError(f"Failed to upload document: {str(e)}")

    async def refresh_auth_token(self) -> bool:
        """Refresh Best Practice authentication token"""
        try:
            auth_string = b64encode(
                f"{self.credentials.client_id}:{self.credentials.client_secret}".encode()
            ).decode()
            
            async with self.session.post(
                "/api/oauth/token",
                headers={"Authorization": f"Basic {auth_string}"},
                data={"grant_type": "client_credentials"}
            ) as response:
                if response.status != 200:
                    raise BestPracticeError("Token refresh failed")
                
                result = await response.json()
                self.credentials.access_token = result["access_token"]
                self.token_expires_at = datetime.utcnow().timestamp() + result["expires_in"]
                
                # Update session headers with new token
                self.session.headers.update(self._get_default_headers())
                return True
        except Exception as e:
            self.error_count += 1
            return False

    def _get_default_headers(self) -> Dict[str, str]:
        """Get default headers for API requests"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "HealthBridge/1.0",
        }
        
        if self.credentials.access_token:
            headers["Authorization"] = f"Bearer {self.credentials.access_token}"
        
        return headers

    def _get_sync_method(self, data_type: DataType, direction: SyncDirection):
        """Get appropriate sync method based on data type and direction"""
        sync_methods = {
            DataType.PATIENT: self._sync_patients,
            DataType.APPOINTMENT: self._sync_appointments,
            DataType.CLINICAL_NOTE: self._sync_clinical_notes,
            DataType.PRESCRIPTION: self._sync_prescriptions,
            DataType.TEST_RESULT: self._sync_test_results,
        }
        return sync_methods.get(data_type)

    async def _sync_patients(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync patient data"""
        # Implementation for patient sync
        pass

    async def _sync_appointments(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync appointment data"""
        # Implementation for appointment sync
        pass

    async def _sync_clinical_notes(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync clinical notes"""
        # Implementation for clinical notes sync
        pass

    async def _sync_prescriptions(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync prescription data"""
        # Implementation for prescription sync
        pass

    async def _sync_test_results(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync test results"""
        # Implementation for test results sync
        pass
