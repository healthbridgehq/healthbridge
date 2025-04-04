export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  medicare: {
    eligible: boolean;
    rebate: number;
    gapPayment: number;
    bulkBilled: boolean;
  };
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  medicareSubmissionStatus: MedicareSubmissionStatus;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  medicareItemNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  medicare: {
    eligible: boolean;
    rebate: number;
  };
}

export interface Payment {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  date: string;
  processorResponse?: {
    success: boolean;
    transactionId?: string;
    error?: string;
  };
}

export interface MedicareItem {
  itemNumber: string;
  description: string;
  fee: number;
  rebate: number;
  category: string;
  restrictions?: string[];
  requirements?: string[];
}

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'paid'
  | 'partially-paid'
  | 'overdue'
  | 'cancelled'
  | 'medicare-submitted'
  | 'medicare-paid';

export type PaymentStatus =
  | 'unpaid'
  | 'partially-paid'
  | 'paid'
  | 'refunded'
  | 'medicare-pending'
  | 'medicare-paid';

export type MedicareSubmissionStatus =
  | 'not-required'
  | 'ready'
  | 'submitted'
  | 'processing'
  | 'paid'
  | 'rejected'
  | 'error';

export type PaymentMethod =
  | 'cash'
  | 'eftpos'
  | 'credit-card'
  | 'medicare'
  | 'private-health'
  | 'bank-transfer';
