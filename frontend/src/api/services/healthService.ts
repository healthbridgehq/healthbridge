import { APIClient } from '../client';
import {
  HealthSummary,
  HealthEvent,
  HealthDocument,
  VitalSigns,
  HealthRecord,
} from '../../types/health';

export interface HealthRecord {
  id: string;
  patientId: string;
  type: string;
  date: string;
  notes: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

class HealthService {
  private client: APIClient;

  constructor() {
    this.client = APIClient.getInstance();
  }

  async getHealthSummary(patientId: string): Promise<HealthSummary> {
    return await this.client.get(`/patients/${patientId}/health-summary`);
  }

  async getHealthTimeline(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      types?: string[];
      limit?: number;
      offset?: number;
    }
  ): Promise<HealthEvent[]> {
    return await this.client.get(`/patients/${patientId}/timeline`, {
      params: options,
    });
  }

  async getDocuments(
    patientId: string,
    options?: {
      category?: string;
      searchTerm?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<HealthDocument[]> {
    return await this.client.get(`/patients/${patientId}/documents`, {
      params: options,
    });
  }

  async getDocument(patientId: string, documentId: string): Promise<HealthDocument> {
    return await this.client.get(
      `/patients/${patientId}/documents/${documentId}`
    );
  }

  async downloadDocument(
    patientId: string,
    documentId: string
  ): Promise<Blob> {
    return await this.client.get(
      `/patients/${patientId}/documents/${documentId}/download`,
      {
        responseType: 'blob',
      }
    );
  }

  async shareDocument(
    patientId: string,
    documentId: string,
    shareData: {
      recipientId: string;
      accessDuration: number;
      note?: string;
    }
  ): Promise<{ shareId: string }> {
    return await this.client.post(
      `/patients/${patientId}/documents/${documentId}/share`,
      shareData
    );
  }

  async getVitalSigns(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<VitalSigns[]> {
    return await this.client.get(`/patients/${patientId}/vitals`, {
      params: options,
    });
  }

  async getMedicalHistory(patientId: string): Promise<{
    conditions: any[];
    procedures: any[];
    familyHistory: any[];
    socialHistory: any[];
  }> {
    return await this.client.get(`/patients/${patientId}/medical-history`);
  }

  async searchMedicalRecords(
    patientId: string,
    query: string,
    options?: {
      categories?: string[];
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    results: any[];
    total: number;
  }> {
    return await this.client.get(`/patients/${patientId}/search`, {
      params: { query, ...options },
    });
  }

  async getHealthMetrics(
    patientId: string,
    metricType: string,
    options?: {
      startDate?: string;
      endDate?: string;
      interval?: 'day' | 'week' | 'month';
    }
  ): Promise<{
    data: any[];
    metadata: any;
  }> {
    return await this.client.get(
      `/patients/${patientId}/metrics/${metricType}`,
      {
        params: options,
      }
    );
  }

  async getHealthRecords(): Promise<HealthRecord[]> {
    return await this.client.get('/health-records');
  }

  async createHealthRecord(data: Partial<HealthRecord>): Promise<HealthRecord> {
    return await this.client.post('/health-records', data);
  }

  async updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<HealthRecord> {
    return await this.client.put(`/health-records/${id}`, data);
  }

  async deleteHealthRecord(id: string): Promise<void> {
    await this.client.delete(`/health-records/${id}`);
  }
}

export const healthService = new HealthService();
