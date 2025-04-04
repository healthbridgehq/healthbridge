import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
from urllib.parse import urljoin
from .base_adapter import (
    BaseClinicAdapter,
    DataType,
    SyncDirection,
    ConnectionStatus,
    SyncResult,
    ClinicCredentials
)

class ClinikoError(Exception):
    """Custom error for Cliniko API issues"""
    pass

class ClinikoAdapter(BaseClinicAdapter):
    """Adapter for Cliniko practice management software"""

    def __init__(self, credentials: ClinicCredentials):
        super().__init__(credentials)
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_remaining = None
        self.rate_limit_reset = None
        self.api_version = "v1"

    async def connect(self) -> bool:
        """Establish connection to Cliniko"""
        try:
            if not self._validate_credentials():
                raise ClinikoError("Invalid credentials")

            self.session = aiohttp.ClientSession(
                base_url=self.credentials.endpoint,
                headers=self._get_default_headers()
            )

            # Test connection
            await self.test_connection()
            self.connection_status = ConnectionStatus.CONNECTED
            return True
        except Exception as e:
            self.connection_status = ConnectionStatus.ERROR
            raise ClinikoError(f"Connection failed: {str(e)}")

    async def disconnect(self) -> bool:
        """Disconnect from Cliniko"""
        try:
            if self.session:
                await self.session.close()
            self.connection_status = ConnectionStatus.DISCONNECTED
            return True
        except Exception as e:
            self.error_count += 1
            return False

    async def test_connection(self) -> bool:
        """Test connection to Cliniko"""
        try:
            if not self.session:
                await self.connect()
            
            async with self.session.get("/api/v1/businesses") as response:
                self._update_rate_limits(response)
                return response.status == 200
        except Exception:
            return False

    async def sync_data(
        self,
        data_type: DataType,
        direction: SyncDirection,
        since: Optional[datetime] = None
    ) -> SyncResult:
        """Sync data with Cliniko"""
        try:
            self.connection_status = ConnectionStatus.SYNCING
            start_time = datetime.utcnow()
            
            sync_method = self._get_sync_method(data_type, direction)
            if not sync_method:
                raise ClinikoError(f"Unsupported data type: {data_type}")
            
            result = await sync_method(since)
            
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
            raise ClinikoError(f"Sync failed: {str(e)}")

    async def get_patient(self, patient_id: str) -> Dict[str, Any]:
        """Retrieve patient data from Cliniko"""
        try:
            async with self.session.get(f"/api/v1/patients/{patient_id}") as response:
                self._update_rate_limits(response)
                
                if response.status == 404:
                    raise ClinikoError("Patient not found")
                elif response.status != 200:
                    raise ClinikoError(f"Failed to get patient: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to get patient: {str(e)}")

    async def update_patient(self, patient_id: str, data: Dict[str, Any]) -> bool:
        """Update patient data in Cliniko"""
        try:
            async with self.session.put(
                f"/api/v1/patients/{patient_id}",
                json=data
            ) as response:
                self._update_rate_limits(response)
                return response.status == 200
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to update patient: {str(e)}")

    async def get_appointments(
        self,
        start_date: datetime,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve appointments from Cliniko"""
        try:
            params = {
                "from": start_date.isoformat(),
                "to": end_date.isoformat() if end_date else None
            }
            
            appointments = []
            page = 1
            
            while True:
                params["page"] = page
                async with self.session.get(
                    "/api/v1/appointments",
                    params=params
                ) as response:
                    self._update_rate_limits(response)
                    
                    if response.status != 200:
                        raise ClinikoError(f"Failed to get appointments: {response.status}")
                    
                    data = await response.json()
                    appointments.extend(data["appointments"])
                    
                    if not data["links"].get("next"):
                        break
                    
                    page += 1
            
            return appointments
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to get appointments: {str(e)}")

    async def create_appointment(self, appointment_data: Dict[str, Any]) -> str:
        """Create new appointment in Cliniko"""
        try:
            async with self.session.post(
                "/api/v1/appointments",
                json=appointment_data
            ) as response:
                self._update_rate_limits(response)
                
                if response.status != 201:
                    raise ClinikoError(f"Failed to create appointment: {response.status}")
                
                result = await response.json()
                return result["id"]
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to create appointment: {str(e)}")

    async def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> bool:
        """Update appointment in Cliniko"""
        try:
            async with self.session.put(
                f"/api/v1/appointments/{appointment_id}",
                json=data
            ) as response:
                self._update_rate_limits(response)
                return response.status == 200
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to update appointment: {str(e)}")

    async def get_clinical_notes(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve clinical notes from Cliniko"""
        try:
            params = {}
            if since:
                params["created_at_from"] = since.isoformat()
            
            notes = []
            page = 1
            
            while True:
                params["page"] = page
                async with self.session.get(
                    f"/api/v1/patients/{patient_id}/treatment_notes",
                    params=params
                ) as response:
                    self._update_rate_limits(response)
                    
                    if response.status != 200:
                        raise ClinikoError(f"Failed to get clinical notes: {response.status}")
                    
                    data = await response.json()
                    notes.extend(data["treatment_notes"])
                    
                    if not data["links"].get("next"):
                        break
                    
                    page += 1
            
            return notes
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to get clinical notes: {str(e)}")

    async def create_clinical_note(
        self,
        patient_id: str,
        note_data: Dict[str, Any]
    ) -> str:
        """Create clinical note in Cliniko"""
        try:
            async with self.session.post(
                f"/api/v1/patients/{patient_id}/treatment_notes",
                json=note_data
            ) as response:
                self._update_rate_limits(response)
                
                if response.status != 201:
                    raise ClinikoError(f"Failed to create clinical note: {response.status}")
                
                result = await response.json()
                return result["id"]
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to create clinical note: {str(e)}")

    async def get_prescriptions(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve prescriptions from Cliniko"""
        # Cliniko doesn't have direct prescription support
        return []

    async def create_prescription(
        self,
        patient_id: str,
        prescription_data: Dict[str, Any]
    ) -> str:
        """Create prescription in Cliniko"""
        # Cliniko doesn't have direct prescription support
        raise ClinikoError("Prescriptions not supported in Cliniko")

    async def get_test_results(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve test results from Cliniko"""
        # Cliniko doesn't have direct test results support
        return []

    async def upload_document(
        self,
        patient_id: str,
        document_data: Dict[str, Any],
        file_content: bytes
    ) -> str:
        """Upload document to Cliniko"""
        try:
            # First, create document record
            async with self.session.post(
                f"/api/v1/patients/{patient_id}/documents",
                json=document_data
            ) as response:
                self._update_rate_limits(response)
                
                if response.status != 201:
                    raise ClinikoError(f"Failed to create document record: {response.status}")
                
                doc_result = await response.json()
                
                # Now upload the file
                form = aiohttp.FormData()
                form.add_field(
                    "file",
                    file_content,
                    filename=document_data.get("filename", "document.pdf")
                )
                
                upload_url = doc_result["upload_url"]
                async with self.session.put(
                    upload_url,
                    data=form
                ) as upload_response:
                    if upload_response.status != 200:
                        # Clean up the document record if upload fails
                        await self.session.delete(f"/api/v1/documents/{doc_result['id']}")
                        raise ClinikoError(f"Failed to upload document file: {upload_response.status}")
                
                return doc_result["id"]
        except Exception as e:
            self.error_count += 1
            raise ClinikoError(f"Failed to upload document: {str(e)}")

    def _get_default_headers(self) -> Dict[str, str]:
        """Get default headers for API requests"""
        return {
            "User-Agent": "HealthBridge/1.0",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.credentials.api_key}"
        }

    def _update_rate_limits(self, response: aiohttp.ClientResponse) -> None:
        """Update rate limit information from response headers"""
        self.rate_limit_remaining = int(response.headers.get("X-RateLimit-Remaining", 0))
        self.rate_limit_reset = int(response.headers.get("X-RateLimit-Reset", 0))
        
        if self.rate_limit_remaining == 0:
            reset_time = datetime.fromtimestamp(self.rate_limit_reset)
            wait_seconds = (reset_time - datetime.now()).total_seconds()
            if wait_seconds > 0:
                asyncio.create_task(self._handle_rate_limit(int(wait_seconds)))

    def _get_sync_method(self, data_type: DataType, direction: SyncDirection):
        """Get appropriate sync method based on data type and direction"""
        sync_methods = {
            DataType.PATIENT: self._sync_patients,
            DataType.APPOINTMENT: self._sync_appointments,
            DataType.CLINICAL_NOTE: self._sync_clinical_notes,
            DataType.DOCUMENT: self._sync_documents
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

    async def _sync_documents(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync documents"""
        # Implementation for document sync
        pass
