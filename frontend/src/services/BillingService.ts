import { api } from './api/client';
import { Invoice, Payment, MedicareItem } from '../types/billing';

export class BillingService {
  private readonly baseUrl = '/api/v1/billing';

  async getAllInvoices(): Promise<Invoice[]> {
    const response = await api.get(`${this.baseUrl}/invoices`);
    return response.data;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await api.get(`${this.baseUrl}/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const response = await api.post(`${this.baseUrl}/invoices`, invoice);
    return response.data;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const response = await api.patch(`${this.baseUrl}/invoices/${id}`, updates);
    return response.data;
  }

  async processPayment(payment: Payment): Promise<void> {
    await api.post(`${this.baseUrl}/payments`, payment);
  }

  async submitToMedicare(invoiceId: string): Promise<void> {
    await api.post(`${this.baseUrl}/medicare/submit/${invoiceId}`);
  }

  async getMedicareItems(): Promise<MedicareItem[]> {
    const response = await api.get(`${this.baseUrl}/medicare/items`);
    return response.data;
  }

  async getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
    const response = await api.get(`${this.baseUrl}/invoices/patient/${patientId}`);
    return response.data;
  }

  async getInvoicesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Invoice[]> {
    const response = await api.get(
      `${this.baseUrl}/invoices/range?start=${startDate}&end=${endDate}`
    );
    return response.data;
  }

  async generateReceipt(invoiceId: string): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/invoices/${invoiceId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getBulkBillingReport(month: string, year: string): Promise<Blob> {
    const response = await api.get(
      `${this.baseUrl}/reports/bulk-billing?month=${month}&year=${year}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  async getRevenueReport(
    startDate: string,
    endDate: string
  ): Promise<{
    totalRevenue: number;
    bulkBilled: number;
    privateBilled: number;
    outstanding: number;
    dailyBreakdown: Array<{
      date: string;
      revenue: number;
      appointments: number;
    }>;
  }> {
    const response = await api.get(
      `${this.baseUrl}/reports/revenue?start=${startDate}&end=${endDate}`
    );
    return response.data;
  }
}
