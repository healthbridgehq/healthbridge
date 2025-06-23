import { APIClient } from '../client';
import { ApiResponse, BaseEntity, DateRangeParams } from '../types';

export interface BillingOverview extends BaseEntity {
  currentRevenue: number;
  revenueChange: number;
  outstandingAmount: number;
  lastUpdated: string;
  currency: string;
  period: {
    start: string;
    end: string;
  };
}

export interface BillingItem extends BaseEntity {
  date: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  medicare?: {
    itemNumber: string;
    rebate: number;
    gap: number;
    claimStatus?: 'pending' | 'submitted' | 'processed' | 'rejected';
    claimReference?: string;
  };
  privateInsurance?: {
    provider: string;
    memberNumber: string;
    claimStatus?: 'pending' | 'submitted' | 'processed' | 'rejected';
    claimReference?: string;
  };
  payment?: {
    method: 'cash' | 'card' | 'direct_debit' | 'medicare' | 'private_insurance';
    reference?: string;
    processedAt?: string;
  };
}

export class BillingService {
  private readonly client: APIClient;
  private static instance: BillingService;
  private readonly baseUrl = '/api/v1/billing';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  async getBillingOverview(): Promise<BillingOverview> {
    return await this.client.get<BillingOverview>(`${this.baseUrl}/overview`);
  }

  async getBillingItems(filters?: DateRangeParams & {
    status?: 'pending' | 'paid' | 'overdue';
    patientId?: string;
    providerId?: string;
  }): Promise<BillingItem[]> {
    return await this.client.get<BillingItem[]>(
      `${this.baseUrl}/items`,
      { url: `${this.baseUrl}/items`, params: filters }
    );
  }

  async createBillingItem(item: Omit<BillingItem, keyof BaseEntity>): Promise<BillingItem> {
    return await this.client.post<BillingItem>(`${this.baseUrl}/items`, item);
  }

  async updateBillingItem(id: string, updates: Partial<Omit<BillingItem, keyof BaseEntity>>): Promise<BillingItem> {
    return await this.client.patch<BillingItem>(`${this.baseUrl}/items/${id}`, updates);
  }

  async deleteBillingItem(id: string): Promise<void> {
    await this.client.delete<void>(`${this.baseUrl}/items/${id}`);
  }

  async generateInvoice(itemIds: string[]): Promise<{ url: string }> {
    return await this.client.post<{ url: string }>(`${this.baseUrl}/invoice`, { itemIds });
  }

  async getBulkInvoice(filters: DateRangeParams & {
    patientId?: string;
    providerId?: string;
    status?: 'pending' | 'paid' | 'overdue';
  }): Promise<{ url: string }> {
    return await this.client.post<{ url: string }>(`${this.baseUrl}/bulk-invoice`, filters);
  }

  async getPaymentSummary(period: DateRangeParams): Promise<{
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    return await this.client.get<{
      total: number;
      byMethod: Record<string, number>;
      byStatus: Record<string, number>;
    }>(`${this.baseUrl}/payment-summary`, {
      url: `${this.baseUrl}/payment-summary`,
      params: period
    });
  }
}

export const billingService = BillingService.getInstance();

export const fetchBillingOverview = () => billingService.getBillingOverview();
