from enum import Enum
from typing import Dict, Type, Optional
from .base_adapter import BaseClinicAdapter, ClinicCredentials
from .best_practice_adapter import BestPracticeAdapter
from .cliniko_adapter import ClinikoAdapter
from .health_engine_adapter import HealthEngineAdapter

class IntegrationType(Enum):
    BEST_PRACTICE = "best_practice"
    CLINIKO = "cliniko"
    HEALTH_ENGINE = "health_engine"

class IntegrationFactory:
    """Factory for creating clinic software integrations"""

    _adapter_map: Dict[IntegrationType, Type[BaseClinicAdapter]] = {
        IntegrationType.BEST_PRACTICE: BestPracticeAdapter,
        IntegrationType.CLINIKO: ClinikoAdapter,
        IntegrationType.HEALTH_ENGINE: HealthEngineAdapter
    }

    @classmethod
    def create_adapter(
        cls,
        integration_type: IntegrationType,
        credentials: ClinicCredentials
    ) -> BaseClinicAdapter:
        """Create an adapter instance for the specified integration type"""
        adapter_class = cls._adapter_map.get(integration_type)
        if not adapter_class:
            raise ValueError(f"Unsupported integration type: {integration_type}")
        
        return adapter_class(credentials)

    @classmethod
    def get_supported_types(cls) -> list[IntegrationType]:
        """Get list of supported integration types"""
        return list(cls._adapter_map.keys())

    @classmethod
    def validate_credentials(
        cls,
        integration_type: IntegrationType,
        credentials: ClinicCredentials
    ) -> bool:
        """Validate credentials for the specified integration type"""
        adapter = cls.create_adapter(integration_type, credentials)
        return adapter._validate_credentials()

class IntegrationManager:
    """Manager for handling multiple clinic integrations"""

    def __init__(self):
        self._active_adapters: Dict[str, BaseClinicAdapter] = {}

    async def add_integration(
        self,
        clinic_id: str,
        integration_type: IntegrationType,
        credentials: ClinicCredentials
    ) -> bool:
        """Add a new integration for a clinic"""
        try:
            adapter = IntegrationFactory.create_adapter(integration_type, credentials)
            await adapter.connect()
            self._active_adapters[clinic_id] = adapter
            return True
        except Exception as e:
            print(f"Failed to add integration: {str(e)}")
            return False

    async def remove_integration(self, clinic_id: str) -> bool:
        """Remove an integration for a clinic"""
        try:
            adapter = self._active_adapters.get(clinic_id)
            if adapter:
                await adapter.disconnect()
                del self._active_adapters[clinic_id]
            return True
        except Exception as e:
            print(f"Failed to remove integration: {str(e)}")
            return False

    def get_adapter(self, clinic_id: str) -> Optional[BaseClinicAdapter]:
        """Get the adapter for a specific clinic"""
        return self._active_adapters.get(clinic_id)

    async def sync_all(self) -> Dict[str, bool]:
        """Sync all active integrations"""
        results = {}
        for clinic_id, adapter in self._active_adapters.items():
            try:
                # Implement sync logic for each adapter
                results[clinic_id] = True
            except Exception as e:
                print(f"Failed to sync clinic {clinic_id}: {str(e)}")
                results[clinic_id] = False
        return results

    def get_status(self) -> Dict[str, Dict]:
        """Get status of all active integrations"""
        return {
            clinic_id: adapter.get_status()
            for clinic_id, adapter in self._active_adapters.items()
        }

    async def close_all(self) -> None:
        """Close all active integrations"""
        for clinic_id in list(self._active_adapters.keys()):
            await self.remove_integration(clinic_id)
