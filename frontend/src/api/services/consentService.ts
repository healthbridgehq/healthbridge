import { APIClient } from '../client';
import {
  ConsentSetting,
  ConsentHistory,
  ConsentRequest,
  EmergencyAccess,
  DataAccessLog,
  DataCategory,
  AccessLevel,
} from '../../types/consent';

class ConsentService {
  private client: APIClient;

  constructor() {
    this.client = APIClient.getInstance();
  }

  async getConsentSettings(patientId: string): Promise<ConsentSetting[]> {
    return await this.client.get(`/patients/${patientId}/consents`);
  }

  async updateConsentSetting(
    patientId: string,
    consentId: string,
    updates: Partial<ConsentSetting>
  ): Promise<ConsentSetting> {
    return await this.client.patch(
      `/patients/${patientId}/consents/${consentId}`,
      updates
    );
  }

  async createConsentSetting(
    patientId: string,
    consent: Omit<ConsentSetting, 'id' | 'lastUpdated' | 'updatedBy'>
  ): Promise<ConsentSetting> {
    return await this.client.post(
      `/patients/${patientId}/consents`,
      consent
    );
  }

  async revokeConsent(
    patientId: string,
    consentId: string,
    reason?: string
  ): Promise<void> {
    return await this.client.delete(
      `/patients/${patientId}/consents/${consentId}`,
      {
        data: { reason },
      }
    );
  }

  async getConsentHistory(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      clinicId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ConsentHistory[]> {
    return await this.client.get(`/patients/${patientId}/consent-history`, {
      params: options,
    });
  }

  async getConsentRequests(
    patientId: string,
    options?: {
      status?: 'pending' | 'approved' | 'denied' | 'expired';
      clinicId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ConsentRequest[]> {
    return await this.client.get(`/patients/${patientId}/consent-requests`, {
      params: options,
    });
  }

  async respondToConsentRequest(
    patientId: string,
    requestId: string,
    response: {
      approved: boolean;
      accessLevel?: AccessLevel;
      dataCategories?: DataCategory[];
      duration?: number;
      notes?: string;
    }
  ): Promise<ConsentRequest> {
    return await this.client.post(
      `/patients/${patientId}/consent-requests/${requestId}/respond`,
      response
    );
  }

  async getEmergencyAccesses(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      clinicId?: string;
      status?: 'pending' | 'reviewed';
      limit?: number;
      offset?: number;
    }
  ): Promise<EmergencyAccess[]> {
    return await this.client.get(
      `/patients/${patientId}/emergency-accesses`,
      {
        params: options,
      }
    );
  }

  async reviewEmergencyAccess(
    patientId: string,
    accessId: string,
    review: {
      approved: boolean;
      notes?: string;
    }
  ): Promise<EmergencyAccess> {
    return await this.client.post(
      `/patients/${patientId}/emergency-accesses/${accessId}/review`,
      review
    );
  }

  async getDataAccessLogs(
    patientId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      clinicId?: string;
      dataCategory?: DataCategory;
      accessType?: 'view' | 'download' | 'share';
      limit?: number;
      offset?: number;
    }
  ): Promise<DataAccessLog[]> {
    return await this.client.get(`/patients/${patientId}/access-logs`, {
      params: options,
    });
  }

  async getDataCategories(): Promise<{
    categories: DataCategory[];
    descriptions: Record<DataCategory, string>;
  }> {
    return await this.client.get('/data-categories');
  }

  async validateConsent(
    patientId: string,
    clinicId: string,
    request: {
      dataCategory: DataCategory;
      accessType: 'view' | 'download' | 'share';
      resourceId?: string;
    }
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiredLevel?: AccessLevel;
  }> {
    return await this.client.post(
      `/patients/${patientId}/clinics/${clinicId}/validate-consent`,
      request
    );
  }
}

export const consentService = new ConsentService();
