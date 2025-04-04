from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.sql import text
from ...models.usage import Usage, UsageType, ResourceType
from ...models.clinic import Clinic
from ...models.billing import BillingRecord, BillingStatus
from ...core.exceptions import UsageTrackingError

class MetricType(Enum):
    API_CALLS = "api_calls"
    STORAGE = "storage"
    AI_REQUESTS = "ai_requests"
    SMS_NOTIFICATIONS = "sms_notifications"
    EMAIL_NOTIFICATIONS = "email_notifications"
    DOCUMENTS_PROCESSED = "documents_processed"

class UsageTrackingService:
    """Service for tracking resource usage and generating billing records"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self._usage_limits = {
            MetricType.API_CALLS: {
                "free": 1000,
                "basic": 10000,
                "professional": 100000,
                "enterprise": float('inf')
            },
            MetricType.AI_REQUESTS: {
                "free": 10,
                "basic": 100,
                "professional": 1000,
                "enterprise": float('inf')
            }
        }
        self._overage_rates = {
            MetricType.API_CALLS: 0.001,  # $0.001 per additional API call
            MetricType.STORAGE: 0.05,     # $0.05 per additional GB
            MetricType.AI_REQUESTS: 0.10,  # $0.10 per additional AI request
            MetricType.SMS_NOTIFICATIONS: 0.05,  # $0.05 per SMS
            MetricType.EMAIL_NOTIFICATIONS: 0.01,  # $0.01 per email
            MetricType.DOCUMENTS_PROCESSED: 0.02  # $0.02 per document
        }

    async def track_usage(
        self,
        clinic_id: int,
        metric_type: MetricType,
        quantity: int = 1,
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Usage:
        """Track usage of a specific metric"""
        try:
            usage = Usage(
                clinic_id=clinic_id,
                metric_type=metric_type.value,
                quantity=quantity,
                resource_id=resource_id,
                metadata=metadata,
                timestamp=datetime.utcnow()
            )
            
            self.db.add(usage)
            await self.db.commit()
            await self.db.refresh(usage)
            
            # Check if usage exceeds limits and create billing record if needed
            await self._check_usage_limits(clinic_id, metric_type)
            
            return usage
        except Exception as e:
            await self.db.rollback()
            raise UsageTrackingError(f"Failed to track usage: {str(e)}")

    async def get_usage_metrics(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime,
        metric_type: Optional[MetricType] = None
    ) -> Dict[str, Any]:
        """Get usage metrics for a specific period"""
        try:
            query = select([
                Usage.metric_type,
                func.sum(Usage.quantity).label("total_quantity"),
                func.count(Usage.id).label("event_count")
            ]).where(
                and_(
                    Usage.clinic_id == clinic_id,
                    Usage.timestamp >= start_date,
                    Usage.timestamp <= end_date
                )
            ).group_by(Usage.metric_type)
            
            if metric_type:
                query = query.where(Usage.metric_type == metric_type.value)
            
            result = await self.db.execute(query)
            metrics = result.fetchall()
            
            return {
                "period_start": start_date,
                "period_end": end_date,
                "metrics": [
                    {
                        "metric_type": metric[0],
                        "total_quantity": metric[1],
                        "event_count": metric[2]
                    }
                    for metric in metrics
                ]
            }
        except Exception as e:
            raise UsageTrackingError(f"Failed to get usage metrics: {str(e)}")

    async def calculate_billing(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> BillingRecord:
        """Calculate billing for usage during a specific period"""
        try:
            # Get clinic's subscription tier
            clinic = await self.db.get(Clinic, clinic_id)
            if not clinic or not clinic.subscription:
                raise UsageTrackingError("No active subscription found")
            
            tier = clinic.subscription.tier
            
            # Get usage metrics
            metrics = await self.get_usage_metrics(clinic_id, start_date, end_date)
            
            total_overage = 0.0
            overage_details = {}
            
            # Calculate overages for each metric
            for metric in metrics["metrics"]:
                metric_type = MetricType(metric["metric_type"])
                limit = self._usage_limits.get(metric_type, {}).get(tier, float('inf'))
                
                if metric["total_quantity"] > limit:
                    overage_quantity = metric["total_quantity"] - limit
                    overage_cost = overage_quantity * self._overage_rates[metric_type]
                    total_overage += overage_cost
                    
                    overage_details[metric_type.value] = {
                        "quantity": overage_quantity,
                        "rate": self._overage_rates[metric_type],
                        "cost": overage_cost
                    }
            
            # Create billing record
            billing_record = BillingRecord(
                clinic_id=clinic_id,
                period_start=start_date,
                period_end=end_date,
                base_amount=clinic.subscription.price,
                overage_amount=total_overage,
                total_amount=clinic.subscription.price + total_overage,
                status=BillingStatus.PENDING,
                details={
                    "subscription_tier": tier,
                    "overages": overage_details,
                    "usage_metrics": metrics
                }
            )
            
            self.db.add(billing_record)
            await self.db.commit()
            await self.db.refresh(billing_record)
            
            return billing_record
        except Exception as e:
            await self.db.rollback()
            raise UsageTrackingError(f"Failed to calculate billing: {str(e)}")

    async def get_resource_usage(
        self,
        clinic_id: int,
        resource_type: ResourceType,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get detailed usage for a specific resource type"""
        try:
            query = select([
                Usage.resource_id,
                func.sum(Usage.quantity).label("total_quantity"),
                func.count(Usage.id).label("event_count"),
                func.min(Usage.timestamp).label("first_used"),
                func.max(Usage.timestamp).label("last_used")
            ]).where(
                and_(
                    Usage.clinic_id == clinic_id,
                    Usage.resource_type == resource_type
                )
            )
            
            if start_date:
                query = query.where(Usage.timestamp >= start_date)
            if end_date:
                query = query.where(Usage.timestamp <= end_date)
            
            query = query.group_by(Usage.resource_id)
            
            result = await self.db.execute(query)
            resources = result.fetchall()
            
            return {
                "resource_type": resource_type.value,
                "period_start": start_date,
                "period_end": end_date,
                "resources": [
                    {
                        "resource_id": r[0],
                        "total_quantity": r[1],
                        "event_count": r[2],
                        "first_used": r[3],
                        "last_used": r[4]
                    }
                    for r in resources
                ]
            }
        except Exception as e:
            raise UsageTrackingError(f"Failed to get resource usage: {str(e)}")

    async def get_usage_trends(
        self,
        clinic_id: int,
        metric_type: MetricType,
        interval: str = 'day',
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get usage trends over time"""
        try:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Create time series based on interval
            interval_sql = {
                'hour': "date_trunc('hour', timestamp)",
                'day': "date_trunc('day', timestamp)",
                'week': "date_trunc('week', timestamp)",
                'month': "date_trunc('month', timestamp)"
            }.get(interval)
            
            if not interval_sql:
                raise UsageTrackingError(f"Invalid interval: {interval}")
            
            query = text(f"""
                WITH time_series AS (
                    SELECT generate_series(
                        date_trunc('{interval}', :start_date),
                        date_trunc('{interval}', :end_date),
                        :interval::interval
                    ) as time_bucket
                )
                SELECT
                    time_series.time_bucket,
                    COALESCE(SUM(u.quantity), 0) as total_quantity,
                    COALESCE(COUNT(u.id), 0) as event_count
                FROM time_series
                LEFT JOIN usage u ON
                    date_trunc('{interval}', u.timestamp) = time_series.time_bucket
                    AND u.clinic_id = :clinic_id
                    AND u.metric_type = :metric_type
                GROUP BY time_series.time_bucket
                ORDER BY time_series.time_bucket
            """)
            
            result = await self.db.execute(
                query,
                {
                    "start_date": start_date,
                    "end_date": end_date,
                    "interval": f"1 {interval}",
                    "clinic_id": clinic_id,
                    "metric_type": metric_type.value
                }
            )
            
            trends = result.fetchall()
            
            return [
                {
                    "timestamp": trend[0],
                    "total_quantity": trend[1],
                    "event_count": trend[2]
                }
                for trend in trends
            ]
        except Exception as e:
            raise UsageTrackingError(f"Failed to get usage trends: {str(e)}")

    async def _check_usage_limits(
        self,
        clinic_id: int,
        metric_type: MetricType
    ) -> None:
        """Check if usage exceeds limits and handle accordingly"""
        try:
            # Get clinic's subscription tier
            clinic = await self.db.get(Clinic, clinic_id)
            if not clinic or not clinic.subscription:
                return
            
            tier = clinic.subscription.tier
            
            # Get current period usage
            period_start = clinic.subscription.current_period_start
            period_end = clinic.subscription.current_period_end
            
            metrics = await self.get_usage_metrics(
                clinic_id,
                period_start,
                period_end,
                metric_type
            )
            
            for metric in metrics["metrics"]:
                if metric["metric_type"] == metric_type.value:
                    limit = self._usage_limits.get(metric_type, {}).get(tier, float('inf'))
                    
                    if metric["total_quantity"] > limit:
                        # Create billing record for overage
                        overage_quantity = metric["total_quantity"] - limit
                        overage_cost = overage_quantity * self._overage_rates[metric_type]
                        
                        billing_record = BillingRecord(
                            clinic_id=clinic_id,
                            period_start=period_start,
                            period_end=period_end,
                            base_amount=0,
                            overage_amount=overage_cost,
                            total_amount=overage_cost,
                            status=BillingStatus.PENDING,
                            details={
                                "metric_type": metric_type.value,
                                "overage_quantity": overage_quantity,
                                "rate": self._overage_rates[metric_type]
                            }
                        )
                        
                        self.db.add(billing_record)
                        await self.db.commit()
        except Exception as e:
            print(f"Failed to check usage limits: {str(e)}")
            # Don't raise exception to prevent blocking usage tracking
