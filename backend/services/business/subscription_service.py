from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import stripe
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from ...models.subscription import Subscription, SubscriptionTier, SubscriptionStatus
from ...models.clinic import Clinic
from ...models.patient import Patient
from ...core.config import settings
from ...core.exceptions import SubscriptionError

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class PricingTier(Enum):
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class SubscriptionFeatures(BaseModel):
    max_patients: int
    max_practitioners: int
    max_storage_gb: int
    ai_features: bool
    priority_support: bool
    custom_branding: bool
    api_access: bool
    advanced_analytics: bool
    white_label: bool

class SubscriptionService:
    """Service for managing subscriptions and billing"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self._pricing_tiers = self._initialize_pricing_tiers()

    def _initialize_pricing_tiers(self) -> Dict[PricingTier, Dict[str, Any]]:
        """Initialize pricing tiers with features and limits"""
        return {
            PricingTier.FREE: {
                "name": "Free",
                "price_monthly": 0,
                "price_yearly": 0,
                "stripe_price_id_monthly": None,
                "stripe_price_id_yearly": None,
                "features": SubscriptionFeatures(
                    max_patients=10,
                    max_practitioners=1,
                    max_storage_gb=1,
                    ai_features=False,
                    priority_support=False,
                    custom_branding=False,
                    api_access=False,
                    advanced_analytics=False,
                    white_label=False
                )
            },
            PricingTier.BASIC: {
                "name": "Basic",
                "price_monthly": 49,
                "price_yearly": 490,
                "stripe_price_id_monthly": "price_basic_monthly",
                "stripe_price_id_yearly": "price_basic_yearly",
                "features": SubscriptionFeatures(
                    max_patients=100,
                    max_practitioners=3,
                    max_storage_gb=10,
                    ai_features=True,
                    priority_support=False,
                    custom_branding=False,
                    api_access=False,
                    advanced_analytics=False,
                    white_label=False
                )
            },
            PricingTier.PROFESSIONAL: {
                "name": "Professional",
                "price_monthly": 99,
                "price_yearly": 990,
                "stripe_price_id_monthly": "price_pro_monthly",
                "stripe_price_id_yearly": "price_pro_yearly",
                "features": SubscriptionFeatures(
                    max_patients=500,
                    max_practitioners=10,
                    max_storage_gb=50,
                    ai_features=True,
                    priority_support=True,
                    custom_branding=True,
                    api_access=True,
                    advanced_analytics=True,
                    white_label=False
                )
            },
            PricingTier.ENTERPRISE: {
                "name": "Enterprise",
                "price_monthly": 299,
                "price_yearly": 2990,
                "stripe_price_id_monthly": "price_enterprise_monthly",
                "stripe_price_id_yearly": "price_enterprise_yearly",
                "features": SubscriptionFeatures(
                    max_patients=float('inf'),
                    max_practitioners=float('inf'),
                    max_storage_gb=500,
                    ai_features=True,
                    priority_support=True,
                    custom_branding=True,
                    api_access=True,
                    advanced_analytics=True,
                    white_label=True
                )
            }
        }

    async def create_subscription(
        self,
        clinic_id: int,
        tier: PricingTier,
        billing_cycle: str,
        payment_method_id: str
    ) -> Subscription:
        """Create a new subscription for a clinic"""
        try:
            # Get clinic
            clinic = await self.db.get(Clinic, clinic_id)
            if not clinic:
                raise SubscriptionError("Clinic not found")

            # Get pricing details
            tier_details = self._pricing_tiers[tier]
            stripe_price_id = (
                tier_details["stripe_price_id_yearly"]
                if billing_cycle == "yearly"
                else tier_details["stripe_price_id_monthly"]
            )

            if stripe_price_id:  # Skip for free tier
                # Create Stripe customer if not exists
                if not clinic.stripe_customer_id:
                    customer = await self._create_stripe_customer(clinic)
                    clinic.stripe_customer_id = customer.id

                # Create Stripe subscription
                stripe_sub = await self._create_stripe_subscription(
                    customer_id=clinic.stripe_customer_id,
                    price_id=stripe_price_id,
                    payment_method_id=payment_method_id
                )

                # Update payment method as default
                await stripe.Customer.modify(
                    clinic.stripe_customer_id,
                    invoice_settings={
                        "default_payment_method": payment_method_id
                    }
                )
            else:
                stripe_sub = None

            # Create subscription record
            subscription = Subscription(
                clinic_id=clinic_id,
                tier=tier.value,
                status=SubscriptionStatus.ACTIVE,
                billing_cycle=billing_cycle,
                stripe_subscription_id=stripe_sub.id if stripe_sub else None,
                current_period_start=datetime.utcnow(),
                current_period_end=datetime.utcnow() + timedelta(
                    days=365 if billing_cycle == "yearly" else 30
                ),
                cancel_at_period_end=False
            )

            self.db.add(subscription)
            await self.db.commit()
            await self.db.refresh(subscription)

            return subscription

        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise SubscriptionError(f"Payment processing failed: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise SubscriptionError(f"Failed to create subscription: {str(e)}")

    async def cancel_subscription(
        self,
        clinic_id: int,
        at_period_end: bool = True
    ) -> Subscription:
        """Cancel a clinic's subscription"""
        try:
            # Get current subscription
            subscription = await self._get_active_subscription(clinic_id)
            if not subscription:
                raise SubscriptionError("No active subscription found")

            if subscription.stripe_subscription_id:
                # Cancel Stripe subscription
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=at_period_end
                )

            if not at_period_end:
                # Update subscription status immediately
                subscription.status = SubscriptionStatus.CANCELLED
                subscription.cancelled_at = datetime.utcnow()
            else:
                subscription.cancel_at_period_end = True

            await self.db.commit()
            await self.db.refresh(subscription)

            return subscription

        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise SubscriptionError(f"Failed to cancel subscription with Stripe: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise SubscriptionError(f"Failed to cancel subscription: {str(e)}")

    async def change_subscription_tier(
        self,
        clinic_id: int,
        new_tier: PricingTier
    ) -> Subscription:
        """Change a clinic's subscription tier"""
        try:
            # Get current subscription
            subscription = await self._get_active_subscription(clinic_id)
            if not subscription:
                raise SubscriptionError("No active subscription found")

            if subscription.stripe_subscription_id:
                # Get new price ID
                tier_details = self._pricing_tiers[new_tier]
                new_price_id = (
                    tier_details["stripe_price_id_yearly"]
                    if subscription.billing_cycle == "yearly"
                    else tier_details["stripe_price_id_monthly"]
                )

                # Update Stripe subscription
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    items=[{
                        "id": subscription.stripe_subscription_id,
                        "price": new_price_id
                    }],
                    proration_behavior="always_invoice"
                )

            # Update subscription tier
            subscription.tier = new_tier.value
            await self.db.commit()
            await self.db.refresh(subscription)

            return subscription

        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise SubscriptionError(f"Failed to update subscription with Stripe: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise SubscriptionError(f"Failed to update subscription tier: {str(e)}")

    async def check_subscription_limits(
        self,
        clinic_id: int,
        check_type: str,
        quantity: int = 1
    ) -> bool:
        """Check if an action would exceed subscription limits"""
        try:
            subscription = await self._get_active_subscription(clinic_id)
            if not subscription:
                return False

            tier = PricingTier(subscription.tier)
            features = self._pricing_tiers[tier]["features"]

            if check_type == "patients":
                current_count = await self._get_patient_count(clinic_id)
                return current_count + quantity <= features.max_patients
            elif check_type == "practitioners":
                current_count = await self._get_practitioner_count(clinic_id)
                return current_count + quantity <= features.max_practitioners
            elif check_type == "storage":
                current_usage = await self._get_storage_usage(clinic_id)
                return current_usage + quantity <= features.max_storage_gb
            else:
                return False

        except Exception as e:
            raise SubscriptionError(f"Failed to check subscription limits: {str(e)}")

    async def get_subscription_features(self, clinic_id: int) -> SubscriptionFeatures:
        """Get features available for a clinic's subscription"""
        subscription = await self._get_active_subscription(clinic_id)
        if not subscription:
            return self._pricing_tiers[PricingTier.FREE]["features"]

        tier = PricingTier(subscription.tier)
        return self._pricing_tiers[tier]["features"]

    async def handle_webhook(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """Handle Stripe webhook events"""
        try:
            if event_type == "customer.subscription.updated":
                await self._handle_subscription_updated(event_data)
            elif event_type == "customer.subscription.deleted":
                await self._handle_subscription_deleted(event_data)
            elif event_type == "invoice.payment_failed":
                await self._handle_payment_failed(event_data)
            return True
        except Exception as e:
            print(f"Failed to handle webhook: {str(e)}")
            return False

    async def _get_active_subscription(self, clinic_id: int) -> Optional[Subscription]:
        """Get the active subscription for a clinic"""
        query = select(Subscription).where(
            and_(
                Subscription.clinic_id == clinic_id,
                Subscription.status == SubscriptionStatus.ACTIVE
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def _create_stripe_customer(self, clinic: Clinic) -> stripe.Customer:
        """Create a new Stripe customer"""
        return await stripe.Customer.create(
            email=clinic.email,
            name=clinic.name,
            metadata={
                "clinic_id": str(clinic.id)
            }
        )

    async def _create_stripe_subscription(
        self,
        customer_id: str,
        price_id: str,
        payment_method_id: str
    ) -> stripe.Subscription:
        """Create a new Stripe subscription"""
        return await stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            default_payment_method=payment_method_id,
            expand=["latest_invoice.payment_intent"]
        )

    async def _handle_subscription_updated(self, event_data: Dict[str, Any]) -> None:
        """Handle Stripe subscription updated event"""
        stripe_sub = event_data["subscription"]
        query = select(Subscription).where(
            Subscription.stripe_subscription_id == stripe_sub["id"]
        )
        result = await self.db.execute(query)
        subscription = result.scalar_one_or_none()

        if subscription:
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_sub["current_period_start"]
            )
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_sub["current_period_end"]
            )
            subscription.status = SubscriptionStatus(stripe_sub["status"])
            await self.db.commit()

    async def _handle_subscription_deleted(self, event_data: Dict[str, Any]) -> None:
        """Handle Stripe subscription deleted event"""
        stripe_sub = event_data["subscription"]
        query = select(Subscription).where(
            Subscription.stripe_subscription_id == stripe_sub["id"]
        )
        result = await self.db.execute(query)
        subscription = result.scalar_one_or_none()

        if subscription:
            subscription.status = SubscriptionStatus.CANCELLED
            subscription.cancelled_at = datetime.utcnow()
            await self.db.commit()

    async def _handle_payment_failed(self, event_data: Dict[str, Any]) -> None:
        """Handle Stripe payment failed event"""
        invoice = event_data["invoice"]
        if invoice["subscription"]:
            query = select(Subscription).where(
                Subscription.stripe_subscription_id == invoice["subscription"]
            )
            result = await self.db.execute(query)
            subscription = result.scalar_one_or_none()

            if subscription:
                subscription.status = SubscriptionStatus.PAST_DUE
                await self.db.commit()

    async def _get_patient_count(self, clinic_id: int) -> int:
        """Get the current number of patients for a clinic"""
        result = await self.db.execute(
            select(Patient).where(Patient.clinic_id == clinic_id)
        )
        return len(result.scalars().all())

    async def _get_practitioner_count(self, clinic_id: int) -> int:
        """Get the current number of practitioners for a clinic"""
        # Implement practitioner count logic
        pass

    async def _get_storage_usage(self, clinic_id: int) -> float:
        """Get the current storage usage in GB for a clinic"""
        # Implement storage usage calculation
        pass
