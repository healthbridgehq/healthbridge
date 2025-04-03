import { APIClient } from '../client';
import { ClinicAnalytics } from '../../types/api';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: {
    day: string;
    slots: string[];
  }[];
}

export interface Appointment {
  id: string;
  patientName: string;
  scheduledTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

export interface ClinicMetrics {
  totalPatients: number;
  totalAppointments: number;
  averageRating: number;
  revenueMetrics: {
    currentRevenue: number;
    revenueChange: number;
    outstandingAmount: number;
  };
}

export interface Invoice {
  id: string;
  appointmentId: string;
  patientName: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

export interface BillingStats {
  totalRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export const fetchClinicAnalytics = async (): Promise<ClinicAnalytics> => {
  return await APIClient.getInstance().get<ClinicAnalytics>('/clinic/analytics');
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  return await APIClient.getInstance().get<Invoice[]>('/clinic/invoices');
};

export const generateInvoice = async (appointmentId: string): Promise<Invoice> => {
  return await APIClient.getInstance().post<Invoice>('/clinic/invoices/generate', { appointmentId });
};

export const sendInvoice = async (invoiceId: string): Promise<void> => {
  await APIClient.getInstance().post(`/clinic/invoices/${invoiceId}/send`);
};

export const recordPayment = async (data: { invoiceId: string; amount: number; method: string }): Promise<void> => {
  await APIClient.getInstance().post(`/clinic/invoices/${data.invoiceId}/payment`, { amount: data.amount, method: data.method });
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return await APIClient.getInstance().get<PaymentMethod[]>('/clinic/payment-methods');
};

export const fetchBillingStats = async (): Promise<BillingStats> => {
  return await APIClient.getInstance().get<BillingStats>('/clinic/billing/stats');
};

export const fetchTodayAppointments = async (): Promise<Appointment[]> => {
  return await APIClient.getInstance().get<Appointment[]>('/clinic/appointments/today');
};

export const fetchAppointments = async (filters?: { status?: string; date?: string }): Promise<Appointment[]> => {
  return await APIClient.getInstance().get<Appointment[]>('/clinic/appointments', { params: filters });
};

export const updateAppointmentStatus = async (appointmentId: string, status: string): Promise<void> => {
  await APIClient.getInstance().put(`/clinic/appointments/${appointmentId}/status`, { status });
};

export const rescheduleAppointment = async (appointmentId: string, newDateTime: Date): Promise<void> => {
  await APIClient.getInstance().put(`/clinic/appointments/${appointmentId}/reschedule`, { newDateTime });
};

export const cancelAppointment = async (appointmentId: string): Promise<void> => {
  await APIClient.getInstance().put(`/clinic/appointments/${appointmentId}/cancel`);
};

export const sendReminder = async (appointmentId: string): Promise<void> => {
  await APIClient.getInstance().post(`/clinic/appointments/${appointmentId}/remind`);
};

export const fetchDoctors = async (): Promise<Doctor[]> => {
  return await APIClient.getInstance().get<Doctor[]>('/clinic/doctors');
};

export const fetchClinicMetrics = async (): Promise<ClinicMetrics> => {
  return await APIClient.getInstance().get<ClinicMetrics>('/clinic/metrics');
};

export const fetchRecentPatients = async (): Promise<any[]> => {
  return await APIClient.getInstance().get<any[]>('/clinic/patients/recent');
};

export const fetchBillingOverview = async (): Promise<any> => {
  return await APIClient.getInstance().get<any>('/clinic/billing/overview');
};
