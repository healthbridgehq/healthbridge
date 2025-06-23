import { APIClient } from '../client';

export interface InsightRequest {
  data: any;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface Metric {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  status?: 'positive' | 'negative' | 'neutral';
}

export interface InsightResponse {
  insights: Insight[];
  metrics: Metric[];
}

export const generateInsights = async (data: InsightRequest): Promise<InsightResponse> => {
  return await APIClient.getInstance().post<InsightResponse>('/ai/insights', data);
};

export const getInsightHistory = async (): Promise<InsightResponse[]> => {
  return await APIClient.getInstance().get<InsightResponse[]>('/ai/insights/history');
};
