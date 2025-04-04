import { APIClient } from '../apiClient';

export interface BillingOverview {
  currentRevenue: number;
  revenueChange: number;
  outstandingAmount: number;
}

const client = APIClient.getInstance();

export const fetchBillingOverview = async (): Promise<BillingOverview> => {
  return await client.get('/clinic/billing/overview');
};
