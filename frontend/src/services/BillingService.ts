import { APIClient } from '../api/client';
import { Invoice, Payment, MedicareItem } from '../types/billing';

export class BillingService {
  private readonly client: APIClient;
  private readonly baseUrl = '/api/v1/billing';
  private static instance: BillingService;

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    const response = await this.client.get<{ data: Invoice[] }>(`${this.baseUrl}/invoices`);
    return response.data;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    return await this.client.get(`${this.baseUrl}/invoices/${id}`);
  }

  async verifyIHI(ihiNumber: string): Promise<boolean> {
    const response = await this.client.post<{ verified: boolean }>(`${this.baseUrl}/verify-ihi`, {
      ihiNumber,
    });
    return response.verified;
  }

  async getAllPayments(): Promise<Payment[]> {
    const response = await this.client.get<{ data: Payment[] }>(`${this.baseUrl}/payments`);
    return response.data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const response = await this.client.post<{ data: Invoice }>(`${this.baseUrl}/invoices`, invoice);
    return response.data;
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const response = await this.client.patch<{ data: Invoice }>(`${this.baseUrl}/invoices/${id}`, updates);
    return response.data;
  }

  async processPayment(payment: Payment): Promise<void> {
    await this.client.post(`${this.baseUrl}/payments`, payment);
  }

  async submitToMedicare(invoiceId: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/medicare/submit/${invoiceId}`);
  }

  async getMedicareItems(): Promise<MedicareItem[]> {
    return await this.client.get(`${this.baseUrl}/medicare/items`);
  }

  async getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
    return await this.client.get(`${this.baseUrl}/invoices/patient/${patientId}`);
  }

  async getInvoicesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Invoice[]> {
    return await this.client.get(
      `${this.baseUrl}/invoices/range?start=${startDate}&end=${endDate}`
    );
  }

  async generateReceipt(invoiceId: string): Promise<Blob> {
    return await this.client.get(`${this.baseUrl}/invoices/${invoiceId}/receipt`, {
      url: `${this.baseUrl}/invoices/${invoiceId}/receipt`,
      responseType: 'blob'
    });
  }

  async getBulkBillingReport(month: string, year: string): Promise<Blob> {
    return await this.client.get(
      `${this.baseUrl}/reports/bulk-billing?month=${month}&year=${year}`,
      {
        url: `${this.baseUrl}/reports/bulk-billing?month=${month}&year=${year}`,
        responseType: 'blob'
      }
    );
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
    return await this.client.get(
      `${this.baseUrl}/reports/revenue?start=${startDate}&end=${endDate}`
    );
  }
}
