import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import aiohttp
import hashlib
import hmac
from urllib.parse import urlencode
from .base_adapter import (
    BaseClinicAdapter,
    DataType,
    SyncDirection,
    ConnectionStatus,
    SyncResult,
    ClinicCredentials
)

class HealthEngineError(Exception):
    """Custom error for HealthEngine API issues"""
    pass

class HealthEngineAdapter(BaseClinicAdapter):
    """Adapter for HealthEngine booking platform"""

    def __init__(self, credentials: ClinicCredentials):
        super().__init__(credentials)
        self.session: Optional[aiohttp.ClientSession] = None
        self.api_version = "v3"
        self.practice_id = credentials.additional_params.get("practice_id")
        if not self.practice_id:
            raise HealthEngineError("practice_id is required in additional_params")

    async def connect(self) -> bool:
        """Establish connection to HealthEngine"""
        try:
            if not self._validate_credentials():
                raise HealthEngineError("Invalid credentials")

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
            raise HealthEngineError(f"Connection failed: {str(e)}")

    async def disconnect(self) -> bool:
        """Disconnect from HealthEngine"""
        try:
            if self.session:
                await self.session.close()
            self.connection_status = ConnectionStatus.DISCONNECTED
            return True
        except Exception as e:
            self.error_count += 1
            return False

    async def test_connection(self) -> bool:
        """Test connection to HealthEngine"""
        try:
            if not self.session:
                await self.connect()
            
            async with self.session.get(
                f"/api/{self.api_version}/practices/{self.practice_id}"
            ) as response:
                return response.status == 200
        except Exception:
            return False

    async def sync_data(
        self,
        data_type: DataType,
        direction: SyncDirection,
        since: Optional[datetime] = None
    ) -> SyncResult:
        """Sync data with HealthEngine"""
        try:
            self.connection_status = ConnectionStatus.SYNCING
            start_time = datetime.utcnow()
            
            sync_method = self._get_sync_method(data_type, direction)
            if not sync_method:
                raise HealthEngineError(f"Unsupported data type: {data_type}")
            
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
            raise HealthEngineError(f"Sync failed: {str(e)}")

    async def get_patient(self, patient_id: str) -> Dict[str, Any]:
        """Retrieve patient data from HealthEngine"""
        try:
            async with self.session.get(
                f"/api/{self.api_version}/patients/{patient_id}"
            ) as response:
                if response.status == 404:
                    raise HealthEngineError("Patient not found")
                elif response.status != 200:
                    raise HealthEngineError(f"Failed to get patient: {response.status}")
                
                return await response.json()
        except Exception as e:
            self.error_count += 1
            raise HealthEngineError(f"Failed to get patient: {str(e)}")

    async def update_patient(self, patient_id: str, data: Dict[str, Any]) -> bool:
        """Update patient data in HealthEngine"""
        try:
            async with self.session.put(
                f"/api/{self.api_version}/patients/{patient_id}",
                json=data
            ) as response:
                return response.status == 200
        except Exception as e:
            self.error_count += 1
            raise HealthEngineError(f"Failed to update patient: {str(e)}")

    async def get_appointments(
        self,
        start_date: datetime,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve appointments from HealthEngine"""
        try:
            params = {
                "practice_id": self.practice_id,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat() if end_date else None
            }
            
            appointments = []
            page = 1
            
            while True:
                params["page"] = page
                async with self.session.get(
                    f"/api/{self.api_version}/appointments",
                    params=params
                ) as response:
                    if response.status != 200:
                        raise HealthEngineError(f"Failed to get appointments: {response.status}")
                    
                    data = await response.json()
                    appointments.extend(data["appointments"])
                    
                    if page >= data["meta"]["total_pages"]:
                        break
                    
                    page += 1
            
            return appointments
        except Exception as e:
            self.error_count += 1
            raise HealthEngineError(f"Failed to get appointments: {str(e)}")

    async def create_appointment(self, appointment_data: Dict[str, Any]) -> str:
        """Create new appointment in HealthEngine"""
        try:
            appointment_data["practice_id"] = self.practice_id
            
            async with self.session.post(
                f"/api/{self.api_version}/appointments",
                json=appointment_data
            ) as response:
                if response.status != 201:
                    raise HealthEngineError(f"Failed to create appointment: {response.status}")
                
                result = await response.json()
                return result["appointment"]["id"]
        except Exception as e:
            self.error_count += 1
            raise HealthEngineError(f"Failed to create appointment: {str(e)}")

    async def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> bool:
        """Update appointment in HealthEngine"""
        try:
            data["practice_id"] = self.practice_id
            
            async with self.session.put(
                f"/api/{self.api_version}/appointments/{appointment_id}",
                json=data
            ) as response:
                return response.status == 200
        except Exception as e:
            self.error_count += 1
            raise HealthEngineError(f"Failed to update appointment: {str(e)}")

    async def get_clinical_notes(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve clinical notes from HealthEngine"""
        # HealthEngine doesn't support clinical notes
        return []

    async def create_clinical_note(
        self,
        patient_id: str,
        note_data: Dict[str, Any]
    ) -> str:
        """Create clinical note in HealthEngine"""
        # HealthEngine doesn't support clinical notes
        raise HealthEngineError("Clinical notes not supported in HealthEngine")

    async def get_prescriptions(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve prescriptions from HealthEngine"""
        # HealthEngine doesn't support prescriptions
        return []

    async def create_prescription(
        self,
        patient_id: str,
        prescription_data: Dict[str, Any]
    ) -> str:
        """Create prescription in HealthEngine"""
        # HealthEngine doesn't support prescriptions
        raise HealthEngineError("Prescriptions not supported in HealthEngine")

    async def get_test_results(
        self,
        patient_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve test results from HealthEngine"""
        # HealthEngine doesn't support test results
        return []

    async def upload_document(
        self,
        patient_id: str,
        document_data: Dict[str, Any],
        file_content: bytes
    ) -> str:
        """Upload document to HealthEngine"""
        # HealthEngine doesn't support document uploads
        raise HealthEngineError("Document uploads not supported in HealthEngine")

    def _get_default_headers(self) -> Dict[str, str]:
        """Get default headers for API requests"""
        return {
            "User-Agent": "HealthBridge/1.0",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-HE-API-Key": self.credentials.api_key,
            "X-HE-Practice-ID": self.practice_id
        }

    def _generate_signature(self, method: str, path: str, timestamp: str) -> str:
        """Generate HMAC signature for request authentication"""
        message = f"{method}\n{path}\n{timestamp}"
        signature = hmac.new(
            self.credentials.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        )
        return signature.hexdigest()

    def _get_sync_method(self, data_type: DataType, direction: SyncDirection):
        """Get appropriate sync method based on data type and direction"""
        sync_methods = {
            DataType.PATIENT: self._sync_patients,
            DataType.APPOINTMENT: self._sync_appointments
        }
        return sync_methods.get(data_type)

    async def _sync_patients(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync patient data"""
        try:
            processed = 0
            succeeded = 0
            failed = 0
            errors = []
            page = 1
            
            params = {
                "practice_id": self.practice_id,
                "modified_since": since.isoformat() if since else None,
                "page": page
            }
            
            while True:
                async with self.session.get(
                    f"/api/{self.api_version}/patients",
                    params=params
                ) as response:
                    if response.status != 200:
                        raise HealthEngineError(f"Failed to sync patients: {response.status}")
                    
                    data = await response.json()
                    patients = data["patients"]
                    processed += len(patients)
                    
                    # Process each patient
                    for patient in patients:
                        try:
                            # Implement patient processing logic
                            succeeded += 1
                        except Exception as e:
                            failed += 1
                            errors.append({
                                "patient_id": patient.get("id"),
                                "error": str(e)
                            })
                    
                    if page >= data["meta"]["total_pages"]:
                        break
                    
                    page += 1
                    params["page"] = page
            
            return {
                "processed": processed,
                "succeeded": succeeded,
                "failed": failed,
                "errors": errors
            }
        except Exception as e:
            raise HealthEngineError(f"Patient sync failed: {str(e)}")

    async def _sync_appointments(self, since: Optional[datetime] = None) -> Dict[str, Any]:
        """Sync appointment data"""
        try:
            processed = 0
            succeeded = 0
            failed = 0
            errors = []
            page = 1
            
            params = {
                "practice_id": self.practice_id,
                "modified_since": since.isoformat() if since else None,
                "page": page
            }
            
            while True:
                async with self.session.get(
                    f"/api/{self.api_version}/appointments",
                    params=params
                ) as response:
                    if response.status != 200:
                        raise HealthEngineError(f"Failed to sync appointments: {response.status}")
                    
                    data = await response.json()
                    appointments = data["appointments"]
                    processed += len(appointments)
                    
                    # Process each appointment
                    for appointment in appointments:
                        try:
                            # Implement appointment processing logic
                            succeeded += 1
                        except Exception as e:
                            failed += 1
                            errors.append({
                                "appointment_id": appointment.get("id"),
                                "error": str(e)
                            })
                    
                    if page >= data["meta"]["total_pages"]:
                        break
                    
                    page += 1
                    params["page"] = page
            
            return {
                "processed": processed,
                "succeeded": succeeded,
                "failed": failed,
                "errors": errors
            }
        except Exception as e:
            raise HealthEngineError(f"Appointment sync failed: {str(e)}")

    async def handle_webhook(self, event_type: str, payload: Dict[str, Any]) -> bool:
        """Handle webhook events from HealthEngine"""
        try:
            # Verify webhook signature
            signature = payload.pop("signature", None)
            timestamp = payload.pop("timestamp", None)
            
            if not signature or not timestamp:
                raise HealthEngineError("Missing webhook signature or timestamp")
            
            expected_signature = self._generate_signature(
                "POST",
                "/webhook",
                timestamp
            )
            
            if not hmac.compare_digest(signature, expected_signature):
                raise HealthEngineError("Invalid webhook signature")
            
            # Process webhook event
            if event_type == "appointment.created":
                # Handle new appointment
                pass
            elif event_type == "appointment.updated":
                # Handle appointment update
                pass
            elif event_type == "appointment.cancelled":
                # Handle appointment cancellation
                pass
            
            return True
        except Exception as e:
            self.error_count += 1
            return False
