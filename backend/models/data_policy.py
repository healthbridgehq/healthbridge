from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import List, Dict, Any

from .base import Base
from .data_consent import DataCategory

class PolicyType(str, Enum):
    RETENTION = "retention"
    ACCESS = "access"
    SHARING = "sharing"
    ENCRYPTION = "encryption"
    ANONYMIZATION = "anonymization"

class PolicyScope(str, Enum):
    GLOBAL = "global"
    CLINIC = "clinic"
    PATIENT = "patient"
    DATA_CATEGORY = "data_category"

class DataPolicy(Base):
    __tablename__ = "data_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    policy_type = Column(Enum(PolicyType), nullable=False)
    scope = Column(Enum(PolicyScope), nullable=False)
    
    # Policy target (depends on scope)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    data_category = Column(Enum(DataCategory), nullable=True)
    
    # Policy rules and settings
    rules = Column(JSON, nullable=False)  # Structured policy rules
    settings = Column(JSON, nullable=False, default=dict)  # Additional settings
    
    # Policy status
    is_active = Column(Boolean, nullable=False, default=True)
    priority = Column(Integer, nullable=False, default=0)  # Higher number = higher priority
    
    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    clinic = relationship("Clinic", back_populates="data_policies")
    patient = relationship("Patient", back_populates="data_policies")
    policy_violations = relationship("PolicyViolation", back_populates="policy")

    def evaluate_access(
        self,
        user_id: int,
        data_category: DataCategory,
        action: str,
        context: Dict[str, Any]
    ) -> bool:
        """
        Evaluate if access should be granted based on this policy.
        
        Args:
            user_id: ID of the user requesting access
            data_category: Category of data being accessed
            action: Type of access being requested
            context: Additional context for policy evaluation
            
        Returns:
            bool: Whether access should be granted
        """
        if not self.is_active or (
            self.expires_at and datetime.utcnow() > self.expires_at
        ):
            return False

        # Evaluate based on policy type
        if self.policy_type == PolicyType.ACCESS:
            return self._evaluate_access_policy(user_id, data_category, action, context)
        elif self.policy_type == PolicyType.SHARING:
            return self._evaluate_sharing_policy(user_id, data_category, action, context)
        elif self.policy_type == PolicyType.RETENTION:
            return self._evaluate_retention_policy(data_category, context)
        
        return True  # Default allow for other policy types

    def _evaluate_access_policy(
        self,
        user_id: int,
        data_category: DataCategory,
        action: str,
        context: Dict[str, Any]
    ) -> bool:
        """Evaluate access control policy rules."""
        rules = self.rules.get("access_rules", {})
        
        # Check user role requirements
        allowed_roles = rules.get("allowed_roles", [])
        if allowed_roles and context.get("user_role") not in allowed_roles:
            return False
            
        # Check time-based restrictions
        time_restrictions = rules.get("time_restrictions", {})
        if time_restrictions:
            current_time = datetime.utcnow()
            if not self._is_within_time_restrictions(current_time, time_restrictions):
                return False
        
        # Check data category restrictions
        category_rules = rules.get("category_rules", {})
        if category_rules and not self._check_category_rules(data_category, action, category_rules):
            return False
            
        return True

    def _evaluate_sharing_policy(
        self,
        user_id: int,
        data_category: DataCategory,
        action: str,
        context: Dict[str, Any]
    ) -> bool:
        """Evaluate data sharing policy rules."""
        rules = self.rules.get("sharing_rules", {})
        
        # Check recipient restrictions
        allowed_recipients = rules.get("allowed_recipients", [])
        if allowed_recipients and context.get("recipient_id") not in allowed_recipients:
            return False
            
        # Check purpose restrictions
        allowed_purposes = rules.get("allowed_purposes", [])
        if allowed_purposes and context.get("purpose") not in allowed_purposes:
            return False
            
        return True

    def _evaluate_retention_policy(
        self,
        data_category: DataCategory,
        context: Dict[str, Any]
    ) -> bool:
        """Evaluate data retention policy rules."""
        rules = self.rules.get("retention_rules", {})
        
        # Check if data is within retention period
        retention_period = rules.get("retention_period", {})
        if retention_period:
            data_created_at = context.get("data_created_at")
            if data_created_at:
                data_age = (datetime.utcnow() - data_created_at).days
                if data_age > retention_period.get("days", float("inf")):
                    return False
                    
        return True

    @staticmethod
    def _is_within_time_restrictions(current_time: datetime, restrictions: Dict) -> bool:
        """Check if current time is within allowed time restrictions."""
        if not restrictions:
            return True
            
        # Check day of week
        allowed_days = restrictions.get("days", list(range(7)))  # 0 = Monday, 6 = Sunday
        if current_time.weekday() not in allowed_days:
            return False
            
        # Check time of day
        start_time = restrictions.get("start_time", "00:00")
        end_time = restrictions.get("end_time", "23:59")
        current_time_str = current_time.strftime("%H:%M")
        
        return start_time <= current_time_str <= end_time

    @staticmethod
    def _check_category_rules(
        data_category: DataCategory,
        action: str,
        rules: Dict
    ) -> bool:
        """Check if action is allowed for the data category."""
        category_rules = rules.get(data_category.value, {})
        allowed_actions = category_rules.get("allowed_actions", [])
        
        return not allowed_actions or action in allowed_actions

class PolicyViolation(Base):
    __tablename__ = "policy_violations"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("data_policies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Violation details
    violation_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    details = Column(JSON, nullable=False)
    
    # Resolution
    resolved = Column(Boolean, nullable=False, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(String, nullable=True)
    
    # Relationships
    policy = relationship("DataPolicy", back_populates="policy_violations")
    user = relationship("User", back_populates="policy_violations")
