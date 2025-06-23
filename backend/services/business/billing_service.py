from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import stripe
from ...models.billing import BillingRecord, BillingStatus, Invoice, InvoiceStatus, PaymentMethod
from ...models.clinic import Clinic
from ...core.config import settings
from ...core.exceptions import BillingError

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class BillingService:
    """Service for managing billing and payments"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invoice(
        self,
        clinic_id: int,
        billing_record: BillingRecord
    ) -> Invoice:
        """Create an invoice from a billing record"""
        try:
            # Get clinic
            clinic = await self.db.get(Clinic, clinic_id)
            if not clinic:
                raise BillingError("Clinic not found")

            # Create Stripe invoice
            if clinic.stripe_customer_id:
                stripe_invoice = await self._create_stripe_invoice(
                    clinic.stripe_customer_id,
                    billing_record
                )
                stripe_invoice_id = stripe_invoice.id
                stripe_invoice_url = stripe_invoice.hosted_invoice_url
            else:
                stripe_invoice_id = None
                stripe_invoice_url = None

            # Create invoice record
            invoice = Invoice(
                clinic_id=clinic_id,
                billing_record_id=billing_record.id,
                amount=billing_record.total_amount,
                status=InvoiceStatus.PENDING,
                due_date=datetime.utcnow() + timedelta(days=30),
                stripe_invoice_id=stripe_invoice_id,
                stripe_invoice_url=stripe_invoice_url,
                line_items=self._generate_line_items(billing_record)
            )

            self.db.add(invoice)
            await self.db.commit()
            await self.db.refresh(invoice)

            # Update billing record status
            billing_record.status = BillingStatus.INVOICED
            await self.db.commit()

            return invoice
        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise BillingError(f"Failed to create Stripe invoice: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise BillingError(f"Failed to create invoice: {str(e)}")

    async def process_payment(
        self,
        invoice_id: int,
        payment_method_id: Optional[str] = None
    ) -> bool:
        """Process payment for an invoice"""
        try:
            # Get invoice
            invoice = await self.db.get(Invoice, invoice_id)
            if not invoice:
                raise BillingError("Invoice not found")

            # Get clinic
            clinic = await self.db.get(Clinic, invoice.clinic_id)
            if not clinic:
                raise BillingError("Clinic not found")

            if invoice.stripe_invoice_id:
                # Process payment through Stripe
                if payment_method_id:
                    # Update payment method if provided
                    stripe.PaymentMethod.attach(
                        payment_method_id,
                        customer=clinic.stripe_customer_id
                    )
                    stripe.Customer.modify(
                        clinic.stripe_customer_id,
                        invoice_settings={
                            "default_payment_method": payment_method_id
                        }
                    )

                # Pay invoice
                stripe.Invoice.pay(invoice.stripe_invoice_id)
                
                # Update invoice status
                invoice.status = InvoiceStatus.PAID
                invoice.paid_at = datetime.utcnow()
                await self.db.commit()

                # Update billing record status
                billing_record = await self.db.get(BillingRecord, invoice.billing_record_id)
                if billing_record:
                    billing_record.status = BillingStatus.PAID
                    await self.db.commit()

                return True
            else:
                # Handle non-Stripe payment logic here
                pass

        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise BillingError(f"Payment processing failed: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise BillingError(f"Failed to process payment: {str(e)}")

    async def add_payment_method(
        self,
        clinic_id: int,
        payment_method_id: str,
        set_default: bool = False
    ) -> PaymentMethod:
        """Add a new payment method for a clinic"""
        try:
            # Get clinic
            clinic = await self.db.get(Clinic, clinic_id)
            if not clinic:
                raise BillingError("Clinic not found")

            if not clinic.stripe_customer_id:
                raise BillingError("No Stripe customer found for clinic")

            # Attach payment method to customer
            payment_method = stripe.PaymentMethod.attach(
                payment_method_id,
                customer=clinic.stripe_customer_id
            )

            if set_default:
                # Set as default payment method
                stripe.Customer.modify(
                    clinic.stripe_customer_id,
                    invoice_settings={
                        "default_payment_method": payment_method_id
                    }
                )

            # Create payment method record
            db_payment_method = PaymentMethod(
                clinic_id=clinic_id,
                stripe_payment_method_id=payment_method_id,
                type=payment_method.type,
                last4=payment_method.card.last4,
                exp_month=payment_method.card.exp_month,
                exp_year=payment_method.card.exp_year,
                brand=payment_method.card.brand,
                is_default=set_default
            )

            self.db.add(db_payment_method)
            await self.db.commit()
            await self.db.refresh(db_payment_method)

            return db_payment_method

        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise BillingError(f"Failed to add payment method: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise BillingError(f"Failed to add payment method: {str(e)}")

    async def remove_payment_method(
        self,
        clinic_id: int,
        payment_method_id: str
    ) -> bool:
        """Remove a payment method"""
        try:
            # Get payment method
            query = select(PaymentMethod).where(
                and_(
                    PaymentMethod.clinic_id == clinic_id,
                    PaymentMethod.stripe_payment_method_id == payment_method_id
                )
            )
            result = await self.db.execute(query)
            payment_method = result.scalar_one_or_none()

            if not payment_method:
                raise BillingError("Payment method not found")

            # Detach from Stripe
            stripe.PaymentMethod.detach(payment_method_id)

            # Remove from database
            await self.db.delete(payment_method)
            await self.db.commit()

            return True

        except stripe.error.StripeError as e:
            await self.db.rollback()
            raise BillingError(f"Failed to remove payment method: {str(e)}")
        except Exception as e:
            await self.db.rollback()
            raise BillingError(f"Failed to remove payment method: {str(e)}")

    async def get_payment_methods(
        self,
        clinic_id: int
    ) -> List[PaymentMethod]:
        """Get all payment methods for a clinic"""
        try:
            query = select(PaymentMethod).where(PaymentMethod.clinic_id == clinic_id)
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            raise BillingError(f"Failed to get payment methods: {str(e)}")

    async def get_billing_history(
        self,
        clinic_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get billing history for a clinic"""
        try:
            query = select(Invoice).where(Invoice.clinic_id == clinic_id)
            
            if start_date:
                query = query.where(Invoice.created_at >= start_date)
            if end_date:
                query = query.where(Invoice.created_at <= end_date)
            
            query = query.order_by(Invoice.created_at.desc())
            
            result = await self.db.execute(query)
            invoices = result.scalars().all()
            
            return [
                {
                    "id": invoice.id,
                    "amount": invoice.amount,
                    "status": invoice.status,
                    "created_at": invoice.created_at,
                    "due_date": invoice.due_date,
                    "paid_at": invoice.paid_at,
                    "line_items": invoice.line_items,
                    "stripe_invoice_url": invoice.stripe_invoice_url
                }
                for invoice in invoices
            ]
        except Exception as e:
            raise BillingError(f"Failed to get billing history: {str(e)}")

    async def handle_webhook(
        self,
        event_type: str,
        event_data: Dict[str, Any]
    ) -> bool:
        """Handle Stripe webhook events"""
        try:
            if event_type == "invoice.paid":
                await self._handle_invoice_paid(event_data)
            elif event_type == "invoice.payment_failed":
                await self._handle_payment_failed(event_data)
            elif event_type == "customer.subscription.deleted":
                await self._handle_subscription_deleted(event_data)
            return True
        except Exception as e:
            print(f"Failed to handle webhook: {str(e)}")
            return False

    async def _create_stripe_invoice(
        self,
        customer_id: str,
        billing_record: BillingRecord
    ) -> stripe.Invoice:
        """Create a Stripe invoice"""
        # Create invoice items
        for item in self._generate_line_items(billing_record):
            stripe.InvoiceItem.create(
                customer=customer_id,
                amount=int(item["amount"] * 100),  # Convert to cents
                currency="usd",
                description=item["description"]
            )

        # Create invoice
        return stripe.Invoice.create(
            customer=customer_id,
            collection_method="charge_automatically",
            auto_advance=True
        )

    def _generate_line_items(
        self,
        billing_record: BillingRecord
    ) -> List[Dict[str, Any]]:
        """Generate line items for an invoice"""
        line_items = []

        # Add base subscription amount
        if billing_record.base_amount > 0:
            line_items.append({
                "description": "Subscription Fee",
                "amount": billing_record.base_amount
            })

        # Add overage charges
        if billing_record.overage_amount > 0:
            overages = billing_record.details.get("overages", {})
            for metric_type, details in overages.items():
                line_items.append({
                    "description": f"Overage - {metric_type}",
                    "amount": details["cost"],
                    "quantity": details["quantity"],
                    "rate": details["rate"]
                })

        return line_items

    async def _handle_invoice_paid(self, event_data: Dict[str, Any]) -> None:
        """Handle Stripe invoice paid event"""
        stripe_invoice = event_data["invoice"]
        query = select(Invoice).where(
            Invoice.stripe_invoice_id == stripe_invoice["id"]
        )
        result = await self.db.execute(query)
        invoice = result.scalar_one_or_none()

        if invoice:
            invoice.status = InvoiceStatus.PAID
            invoice.paid_at = datetime.utcnow()
            await self.db.commit()

    async def _handle_payment_failed(self, event_data: Dict[str, Any]) -> None:
        """Handle Stripe payment failed event"""
        stripe_invoice = event_data["invoice"]
        query = select(Invoice).where(
            Invoice.stripe_invoice_id == stripe_invoice["id"]
        )
        result = await self.db.execute(query)
        invoice = result.scalar_one_or_none()

        if invoice:
            invoice.status = InvoiceStatus.FAILED
            await self.db.commit()

    async def _handle_subscription_deleted(self, event_data: Dict[str, Any]) -> None:
        """Handle Stripe subscription deleted event"""
        # Implement subscription deletion logic
        pass
