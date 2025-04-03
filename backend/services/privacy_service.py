from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session

from ..models.data_consent import DataConsent, DataCategory, AccessLevel
from ..models.data_policy import DataPolicy, PolicyType, PolicyScope
from ..models.audit_log import AuditLog, ActionType, ResourceType
from ..models.integration import Integration, IntegrationType

class PrivacyService:
    def __init__(self, db_session: Session):
        self.db = db_session

    async def check_access_permission(
        self,
        user_id: int,
        patient_id: int,
        data_category: DataCategory,
        action: str,
        clinic_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, str]:
        """
        Check if a user has permission to access patient data.
        
        Args:
            user_id: ID of the user requesting access
            patient_id: ID of the patient whose data is being accessed
            data_category: Category of data being accessed
            action: Type of access being requested
            clinic_id: Optional clinic ID for clinic-specific checks
            context: Additional context for policy evaluation
            
        Returns:
            Tuple[bool, str]: (has_permission, reason)
        """
        context = context or {}
        
        # Check consents
        consent = await self._get_active_consent(patient_id, clinic_id)
        if not consent:
            return False, "No active consent found"
            
        if consent.access_level == AccessLevel.NONE:
            return False, "Access explicitly denied"
            
        if data_category.value not in consent.data_categories:
            return False, f"No consent for {data_category.value} data"
            
        # Check policies
        policies = await self._get_applicable_policies(
            patient_id,
            clinic_id,
            data_category
        )
        
        for policy in policies:
            if not policy.evaluate_access(user_id, data_category, action, context):
                return False, f"Policy {policy.name} denies access"
                
        # Log the access attempt
        await self._log_access_attempt(
            user_id=user_id,
            patient_id=patient_id,
            data_category=data_category,
            action=action,
            clinic_id=clinic_id,
            success=True,
            context=context
        )
                
        return True, "Access granted"

    async def grant_consent(
        self,
        patient_id: int,
        clinic_id: int,
        access_level: AccessLevel,
        data_categories: List[DataCategory],
        purposes: List[str],
        valid_until: Optional[datetime] = None,
        granted_by: int = None
    ) -> DataConsent:
        """
        Grant consent for a clinic to access patient data.
        
        Args:
            patient_id: ID of the patient granting consent
            clinic_id: ID of the clinic receiving consent
            access_level: Level of access being granted
            data_categories: Categories of data included in consent
            purposes: Approved purposes for data access
            valid_until: Optional expiration date
            granted_by: ID of user granting consent (usually patient_id)
            
        Returns:
            DataConsent: The created consent record
        """
        # Revoke any existing consents
        await self._revoke_existing_consents(patient_id, clinic_id)
        
        # Create new consent
        consent = DataConsent(
            patient_id=patient_id,
            clinic_id=clinic_id,
            access_level=access_level,
            data_categories={cat.value: "all" for cat in data_categories},
            purposes=purposes,
            valid_until=valid_until,
            created_by=granted_by or patient_id,
            last_modified_by=granted_by or patient_id
        )
        
        self.db.add(consent)
        await self.db.commit()
        await self.db.refresh(consent)
        
        # Log consent grant
        await self._log_consent_change(
            consent_id=consent.id,
            action=ActionType.GRANT,
            user_id=granted_by or patient_id,
            clinic_id=clinic_id
        )
        
        return consent

    async def revoke_consent(
        self,
        consent_id: int,
        revoked_by: int,
        reason: str = None
    ) -> bool:
        """
        Revoke an existing consent.
        
        Args:
            consent_id: ID of the consent to revoke
            revoked_by: ID of user revoking consent
            reason: Optional reason for revocation
            
        Returns:
            bool: True if consent was revoked
        """
        consent = await self.db.query(DataConsent).get(consent_id)
        if not consent:
            return False
            
        # Update consent
        consent.access_level = AccessLevel.NONE
        consent.valid_until = datetime.utcnow()
        consent.last_modified_by = revoked_by
        
        await self.db.commit()
        
        # Log revocation
        await self._log_consent_change(
            consent_id=consent_id,
            action=ActionType.REVOKE,
            user_id=revoked_by,
            clinic_id=consent.clinic_id,
            details={"reason": reason} if reason else None
        )
        
        return True

    async def get_patient_consents(
        self,
        patient_id: int,
        include_expired: bool = False
    ) -> List[DataConsent]:
        """Get all consents for a patient."""
        query = self.db.query(DataConsent).filter(
            DataConsent.patient_id == patient_id
        )
        
        if not include_expired:
            query = query.filter(
                (DataConsent.valid_until.is_(None)) |
                (DataConsent.valid_until > datetime.utcnow())
            )
            
        return await query.all()

    async def get_clinic_consents(
        self,
        clinic_id: int,
        include_expired: bool = False
    ) -> List[DataConsent]:
        """Get all consents granted to a clinic."""
        query = self.db.query(DataConsent).filter(
            DataConsent.clinic_id == clinic_id
        )
        
        if not include_expired:
            query = query.filter(
                (DataConsent.valid_until.is_(None)) |
                (DataConsent.valid_until > datetime.utcnow())
            )
            
        return await query.all()

    async def _get_active_consent(
        self,
        patient_id: int,
        clinic_id: Optional[int]
    ) -> Optional[DataConsent]:
        """Get active consent for patient and clinic combination."""
        query = self.db.query(DataConsent).filter(
            DataConsent.patient_id == patient_id,
            (DataConsent.valid_until.is_(None)) |
            (DataConsent.valid_until > datetime.utcnow())
        )
        
        if clinic_id:
            query = query.filter(DataConsent.clinic_id == clinic_id)
            
        return await query.first()

    async def _get_applicable_policies(
        self,
        patient_id: int,
        clinic_id: Optional[int],
        data_category: DataCategory
    ) -> List[DataPolicy]:
        """Get all policies that apply to this access request."""
        policies = []
        
        # Get global policies
        global_policies = await self.db.query(DataPolicy).filter(
            DataPolicy.scope == PolicyScope.GLOBAL,
            DataPolicy.is_active == True
        ).all()
        policies.extend(global_policies)
        
        # Get patient-specific policies
        patient_policies = await self.db.query(DataPolicy).filter(
            DataPolicy.scope == PolicyScope.PATIENT,
            DataPolicy.patient_id == patient_id,
            DataPolicy.is_active == True
        ).all()
        policies.extend(patient_policies)
        
        if clinic_id:
            # Get clinic-specific policies
            clinic_policies = await self.db.query(DataPolicy).filter(
                DataPolicy.scope == PolicyScope.CLINIC,
                DataPolicy.clinic_id == clinic_id,
                DataPolicy.is_active == True
            ).all()
            policies.extend(clinic_policies)
        
        # Get data category policies
        category_policies = await self.db.query(DataPolicy).filter(
            DataPolicy.scope == PolicyScope.DATA_CATEGORY,
            DataPolicy.data_category == data_category,
            DataPolicy.is_active == True
        ).all()
        policies.extend(category_policies)
        
        # Sort by priority
        return sorted(policies, key=lambda p: p.priority, reverse=True)

    async def _log_access_attempt(
        self,
        user_id: int,
        patient_id: int,
        data_category: DataCategory,
        action: str,
        clinic_id: Optional[int],
        success: bool,
        context: Dict[str, Any]
    ) -> None:
        """Log an access attempt to the audit log."""
        await AuditLog.log_action(
            db_session=self.db,
            action=ActionType.VIEW if action == "view" else ActionType.UPDATE,
            resource_type=ResourceType.HEALTH_RECORD,
            resource_id=patient_id,
            user_id=user_id,
            clinic_id=clinic_id,
            ip_address=context.get("ip_address", "unknown"),
            details={
                "data_category": data_category.value,
                "action": action,
                **context
            },
            success=success
        )

    async def _log_consent_change(
        self,
        consent_id: int,
        action: ActionType,
        user_id: int,
        clinic_id: int,
        details: Dict[str, Any] = None
    ) -> None:
        """Log a consent change to the audit log."""
        await AuditLog.log_action(
            db_session=self.db,
            action=action,
            resource_type=ResourceType.CONSENT,
            resource_id=consent_id,
            user_id=user_id,
            clinic_id=clinic_id,
            ip_address="system",  # Consent changes are system actions
            details=details or {}
        )
