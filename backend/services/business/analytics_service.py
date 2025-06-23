from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, text
from ...models.patient import Patient
from ...models.appointment import Appointment
from ...models.clinical_note import ClinicalNote
from ...models.usage import Usage
from ...models.billing import BillingRecord
from ...core.exceptions import AnalyticsError

class AnalyticsService:
    """Service for generating clinic analytics and insights"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_clinic_overview(
        self,
        clinic_id: int,
        period: str = 'month'
    ) -> Dict[str, Any]:
        """Get overview metrics for a clinic"""
        try:
            end_date = datetime.utcnow()
            if period == 'week':
                start_date = end_date - timedelta(days=7)
            elif period == 'month':
                start_date = end_date - timedelta(days=30)
            elif period == 'quarter':
                start_date = end_date - timedelta(days=90)
            elif period == 'year':
                start_date = end_date - timedelta(days=365)
            else:
                raise AnalyticsError(f"Invalid period: {period}")

            # Get key metrics
            total_patients = await self._get_total_patients(clinic_id)
            new_patients = await self._get_new_patients(clinic_id, start_date)
            appointment_stats = await self._get_appointment_stats(clinic_id, start_date, end_date)
            revenue_stats = await self._get_revenue_stats(clinic_id, start_date, end_date)
            engagement_stats = await self._get_engagement_stats(clinic_id, start_date, end_date)

            return {
                "period": {
                    "start": start_date,
                    "end": end_date
                },
                "patients": {
                    "total": total_patients,
                    "new": new_patients,
                    "growth_rate": (new_patients / total_patients * 100) if total_patients > 0 else 0
                },
                "appointments": appointment_stats,
                "revenue": revenue_stats,
                "engagement": engagement_stats
            }
        except Exception as e:
            raise AnalyticsError(f"Failed to get clinic overview: {str(e)}")

    async def get_patient_demographics(
        self,
        clinic_id: int
    ) -> Dict[str, Any]:
        """Get patient demographic analytics"""
        try:
            query = text("""
                SELECT
                    age_bucket,
                    gender,
                    COUNT(*) as count
                FROM (
                    SELECT
                        CASE
                            WHEN age < 18 THEN '0-17'
                            WHEN age BETWEEN 18 AND 30 THEN '18-30'
                            WHEN age BETWEEN 31 AND 50 THEN '31-50'
                            WHEN age BETWEEN 51 AND 70 THEN '51-70'
                            ELSE '71+'
                        END as age_bucket,
                        gender
                    FROM patients
                    WHERE clinic_id = :clinic_id
                ) demographics
                GROUP BY age_bucket, gender
                ORDER BY age_bucket, gender
            """)

            result = await self.db.execute(
                query,
                {"clinic_id": clinic_id}
            )
            demographics = result.fetchall()

            # Get location distribution
            location_query = text("""
                SELECT
                    postal_code,
                    COUNT(*) as count
                FROM patients
                WHERE clinic_id = :clinic_id
                GROUP BY postal_code
                ORDER BY count DESC
                LIMIT 10
            """)

            location_result = await self.db.execute(
                location_query,
                {"clinic_id": clinic_id}
            )
            locations = location_result.fetchall()

            return {
                "age_gender_distribution": [
                    {
                        "age_bucket": d[0],
                        "gender": d[1],
                        "count": d[2]
                    }
                    for d in demographics
                ],
                "location_distribution": [
                    {
                        "postal_code": l[0],
                        "count": l[1]
                    }
                    for l in locations
                ]
            }
        except Exception as e:
            raise AnalyticsError(f"Failed to get patient demographics: {str(e)}")

    async def get_appointment_analytics(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get detailed appointment analytics"""
        try:
            # Get appointment distribution by day and hour
            time_query = text("""
                SELECT
                    EXTRACT(DOW FROM start_time) as day_of_week,
                    EXTRACT(HOUR FROM start_time) as hour,
                    COUNT(*) as count
                FROM appointments
                WHERE
                    clinic_id = :clinic_id
                    AND start_time BETWEEN :start_date AND :end_date
                GROUP BY day_of_week, hour
                ORDER BY day_of_week, hour
            """)

            time_result = await self.db.execute(
                time_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            time_distribution = time_result.fetchall()

            # Get cancellation analytics
            cancel_query = text("""
                SELECT
                    cancellation_reason,
                    COUNT(*) as count,
                    AVG(EXTRACT(EPOCH FROM (start_time - cancelled_at)) / 3600) as avg_notice_hours
                FROM appointments
                WHERE
                    clinic_id = :clinic_id
                    AND status = 'cancelled'
                    AND start_time BETWEEN :start_date AND :end_date
                GROUP BY cancellation_reason
                ORDER BY count DESC
            """)

            cancel_result = await self.db.execute(
                cancel_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            cancellations = cancel_result.fetchall()

            # Get practitioner utilization
            utilization_query = text("""
                SELECT
                    p.id,
                    p.name,
                    COUNT(a.id) as total_appointments,
                    SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                    SUM(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 3600) as total_hours
                FROM practitioners p
                LEFT JOIN appointments a ON a.practitioner_id = p.id
                WHERE
                    p.clinic_id = :clinic_id
                    AND (a.start_time BETWEEN :start_date AND :end_date OR a.start_time IS NULL)
                GROUP BY p.id, p.name
                ORDER BY total_appointments DESC
            """)

            utilization_result = await self.db.execute(
                utilization_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            utilization = utilization_result.fetchall()

            return {
                "time_distribution": [
                    {
                        "day": int(t[0]),
                        "hour": int(t[1]),
                        "count": t[2]
                    }
                    for t in time_distribution
                ],
                "cancellations": [
                    {
                        "reason": c[0],
                        "count": c[1],
                        "avg_notice_hours": round(c[2], 1) if c[2] else 0
                    }
                    for c in cancellations
                ],
                "practitioner_utilization": [
                    {
                        "practitioner_id": u[0],
                        "name": u[1],
                        "total_appointments": u[2],
                        "completed": u[3],
                        "cancelled": u[4],
                        "total_hours": round(u[5], 1) if u[5] else 0,
                        "utilization_rate": round(u[3] / u[2] * 100, 1) if u[2] > 0 else 0
                    }
                    for u in utilization
                ]
            }
        except Exception as e:
            raise AnalyticsError(f"Failed to get appointment analytics: {str(e)}")

    async def get_revenue_analytics(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get detailed revenue analytics"""
        try:
            # Get revenue by service type
            service_query = text("""
                SELECT
                    service_type,
                    COUNT(*) as appointment_count,
                    SUM(fee) as total_revenue,
                    AVG(fee) as avg_fee
                FROM appointments
                WHERE
                    clinic_id = :clinic_id
                    AND status = 'completed'
                    AND start_time BETWEEN :start_date AND :end_date
                GROUP BY service_type
                ORDER BY total_revenue DESC
            """)

            service_result = await self.db.execute(
                service_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            services = service_result.fetchall()

            # Get revenue trends
            trend_query = text("""
                SELECT
                    DATE_TRUNC('day', start_time) as date,
                    COUNT(*) as appointment_count,
                    SUM(fee) as daily_revenue
                FROM appointments
                WHERE
                    clinic_id = :clinic_id
                    AND status = 'completed'
                    AND start_time BETWEEN :start_date AND :end_date
                GROUP BY date
                ORDER BY date
            """)

            trend_result = await self.db.execute(
                trend_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            trends = trend_result.fetchall()

            # Get payment method distribution
            payment_query = text("""
                SELECT
                    payment_method,
                    COUNT(*) as count,
                    SUM(amount) as total_amount
                FROM payments
                WHERE
                    clinic_id = :clinic_id
                    AND created_at BETWEEN :start_date AND :end_date
                GROUP BY payment_method
                ORDER BY total_amount DESC
            """)

            payment_result = await self.db.execute(
                payment_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            payments = payment_result.fetchall()

            return {
                "service_revenue": [
                    {
                        "service_type": s[0],
                        "appointment_count": s[1],
                        "total_revenue": float(s[2]),
                        "avg_fee": float(s[3])
                    }
                    for s in services
                ],
                "daily_trends": [
                    {
                        "date": t[0],
                        "appointment_count": t[1],
                        "revenue": float(t[2])
                    }
                    for t in trends
                ],
                "payment_methods": [
                    {
                        "method": p[0],
                        "count": p[1],
                        "total_amount": float(p[2])
                    }
                    for p in payments
                ]
            }
        except Exception as e:
            raise AnalyticsError(f"Failed to get revenue analytics: {str(e)}")

    async def get_engagement_analytics(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get patient engagement analytics"""
        try:
            # Get portal usage metrics
            usage_query = text("""
                SELECT
                    metric_type,
                    COUNT(DISTINCT patient_id) as unique_users,
                    COUNT(*) as total_events,
                    AVG(quantity) as avg_quantity
                FROM usage_events
                WHERE
                    clinic_id = :clinic_id
                    AND timestamp BETWEEN :start_date AND :end_date
                GROUP BY metric_type
                ORDER BY total_events DESC
            """)

            usage_result = await self.db.execute(
                usage_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            usage = usage_result.fetchall()

            # Get notification effectiveness
            notification_query = text("""
                SELECT
                    notification_type,
                    COUNT(*) as sent_count,
                    SUM(CASE WHEN opened = true THEN 1 ELSE 0 END) as opened_count,
                    SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END) as clicked_count
                FROM notifications
                WHERE
                    clinic_id = :clinic_id
                    AND sent_at BETWEEN :start_date AND :end_date
                GROUP BY notification_type
                ORDER BY sent_count DESC
            """)

            notification_result = await self.db.execute(
                notification_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            notifications = notification_result.fetchall()

            # Get feature adoption rates
            feature_query = text("""
                SELECT
                    feature_name,
                    COUNT(DISTINCT patient_id) as unique_users,
                    COUNT(*) as total_uses
                FROM feature_usage
                WHERE
                    clinic_id = :clinic_id
                    AND timestamp BETWEEN :start_date AND :end_date
                GROUP BY feature_name
                ORDER BY total_uses DESC
            """)

            feature_result = await self.db.execute(
                feature_query,
                {
                    "clinic_id": clinic_id,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            features = feature_result.fetchall()

            return {
                "portal_usage": [
                    {
                        "metric_type": u[0],
                        "unique_users": u[1],
                        "total_events": u[2],
                        "avg_quantity": float(u[3])
                    }
                    for u in usage
                ],
                "notifications": [
                    {
                        "type": n[0],
                        "sent": n[1],
                        "opened": n[2],
                        "clicked": n[3],
                        "open_rate": round(n[2] / n[1] * 100, 1) if n[1] > 0 else 0,
                        "click_rate": round(n[3] / n[1] * 100, 1) if n[1] > 0 else 0
                    }
                    for n in notifications
                ],
                "feature_adoption": [
                    {
                        "feature": f[0],
                        "unique_users": f[1],
                        "total_uses": f[2]
                    }
                    for f in features
                ]
            }
        except Exception as e:
            raise AnalyticsError(f"Failed to get engagement analytics: {str(e)}")

    async def _get_total_patients(self, clinic_id: int) -> int:
        """Get total number of patients"""
        result = await self.db.execute(
            select(func.count(Patient.id)).where(Patient.clinic_id == clinic_id)
        )
        return result.scalar_one()

    async def _get_new_patients(
        self,
        clinic_id: int,
        since: datetime
    ) -> int:
        """Get number of new patients since a date"""
        result = await self.db.execute(
            select(func.count(Patient.id)).where(
                and_(
                    Patient.clinic_id == clinic_id,
                    Patient.created_at >= since
                )
            )
        )
        return result.scalar_one()

    async def _get_appointment_stats(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get appointment statistics"""
        query = select([
            func.count(Appointment.id).label("total"),
            func.sum(case((Appointment.status == "completed", 1), else_=0)).label("completed"),
            func.sum(case((Appointment.status == "cancelled", 1), else_=0)).label("cancelled"),
            func.avg(Appointment.duration).label("avg_duration")
        ]).where(
            and_(
                Appointment.clinic_id == clinic_id,
                Appointment.start_time.between(start_date, end_date)
            )
        )

        result = await self.db.execute(query)
        stats = result.fetchone()

        return {
            "total": stats[0],
            "completed": stats[1],
            "cancelled": stats[2],
            "completion_rate": round(stats[1] / stats[0] * 100, 1) if stats[0] > 0 else 0,
            "avg_duration_minutes": round(stats[3], 1) if stats[3] else 0
        }

    async def _get_revenue_stats(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get revenue statistics"""
        query = select([
            func.sum(BillingRecord.total_amount).label("total_revenue"),
            func.avg(BillingRecord.total_amount).label("avg_transaction"),
            func.count(BillingRecord.id).label("transaction_count")
        ]).where(
            and_(
                BillingRecord.clinic_id == clinic_id,
                BillingRecord.created_at.between(start_date, end_date),
                BillingRecord.status == "paid"
            )
        )

        result = await self.db.execute(query)
        stats = result.fetchone()

        return {
            "total_revenue": float(stats[0]) if stats[0] else 0,
            "avg_transaction": float(stats[1]) if stats[1] else 0,
            "transaction_count": stats[2]
        }

    async def _get_engagement_stats(
        self,
        clinic_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get engagement statistics"""
        usage_query = select([
            func.count(Usage.id).label("total_events"),
            func.count(distinct(Usage.patient_id)).label("active_users")
        ]).where(
            and_(
                Usage.clinic_id == clinic_id,
                Usage.timestamp.between(start_date, end_date)
            )
        )

        usage_result = await self.db.execute(usage_query)
        usage_stats = usage_result.fetchone()

        return {
            "total_events": usage_stats[0],
            "active_users": usage_stats[1]
        }
