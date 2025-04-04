import { APIClient } from '../../api/apiClient';

export interface ConsentRecord {
  id?: string;
  patientId: string;
  providerId: string;
  purpose: string;
  dataCategories: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'withdrawn' | 'expired';
  withdrawalReason?: string;
  auditLog: Array<{
    timestamp: string;
    action: 'granted' | 'accessed' | 'withdrawn';
    actorId: string;
    details: string;
  }>;
}

export interface DataAccessRequest {
  id?: string;
  requesterId: string;
  patientId: string;
  purpose: string;
  dataCategories: string[];
  justification: string;
  status: 'pending' | 'approved' | 'denied';
  responseDate?: string;
  responseReason?: string;
}

export interface PrivacyBreach {
  id: string;
  detectionDate: string;
  type: 'unauthorized_access' | 'data_leak' | 'system_breach' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRecords: number;
  description: string;
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  containmentActions: string[];
  notificationStatus: 'pending' | 'notified' | 'completed';
}

class PrivacyService {
  private static instance: PrivacyService;
  private client: APIClient;
  private readonly baseUrl: string = 'https://api.healthbridge-au.com/privacy';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): PrivacyService {
    if (!PrivacyService.instance) {
      PrivacyService.instance = new PrivacyService();
    }
    return PrivacyService.instance;
  }

  // Consent Management
  async recordConsent(consent: Omit<ConsentRecord, 'id' | 'auditLog'>): Promise<ConsentRecord> {
    return await this.client.post<ConsentRecord>(`${this.baseUrl}/consent`, consent);
  }

  async withdrawConsent(consentId: string, reason: string): Promise<ConsentRecord> {
    return await this.client.put<ConsentRecord>(`${this.baseUrl}/consent/${consentId}/withdraw`, { reason });
  }

  async getPatientConsents(patientId: string): Promise<ConsentRecord[]> {
    return await this.client.get<ConsentRecord[]>(`${this.baseUrl}/consent/patient/${patientId}`);
  }

  async verifyConsent(patientId: string, providerId: string, dataCategory: string): Promise<boolean> {
    const response = await this.client.post<{ hasConsent: boolean }>(`${this.baseUrl}/consent/verify`, {
      patientId,
      providerId,
      dataCategory,
    });
    return response.hasConsent;
  }

  // Data Access Requests
  async requestAccess(request: Omit<DataAccessRequest, 'id' | 'status' | 'responseDate'>): Promise<DataAccessRequest> {
    return await this.client.post<DataAccessRequest>(`${this.baseUrl}/access-requests`, request);
  }

  async respondToAccessRequest(
    requestId: string,
    approved: boolean,
    reason: string
  ): Promise<DataAccessRequest> {
    return await this.client.put<DataAccessRequest>(`${this.baseUrl}/access-requests/${requestId}/respond`, {
      approved,
      reason,
    });
  }

  // Privacy Breach Handling
  async reportBreach(
    breach: Omit<PrivacyBreach, 'id' | 'status' | 'notificationStatus'>
  ): Promise<PrivacyBreach> {
    return await this.client.post<PrivacyBreach>(`${this.baseUrl}/breaches`, breach);
  }

  async updateBreachStatus(
    breachId: string,
    status: PrivacyBreach['status'],
    actions: string[]
  ): Promise<PrivacyBreach> {
    return await this.client.put<PrivacyBreach>(`${this.baseUrl}/breaches/${breachId}`, {
      status,
      containmentActions: actions,
    });
  }

  async notifyAffectedParties(breachId: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/breaches/${breachId}/notify`, {});
  }

  // APP Compliance
  async generatePrivacyImpactAssessment(systemId: string): Promise<{
    assessmentId: string;
    risks: Array<{
      category: string;
      likelihood: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      mitigations: string[];
    }>;
    recommendations: string[];
  }> {
    return await this.client.post(`${this.baseUrl}/impact-assessment`, { systemId });
  }

  async logDataAccess(
    patientId: string,
    accessorId: string,
    purpose: string,
    dataAccessed: string[]
  ): Promise<void> {
    await this.client.post(`${this.baseUrl}/audit-log`, {
      patientId,
      accessorId,
      purpose,
      dataAccessed,
      timestamp: new Date().toISOString(),
    });
  }

  async getDataAccessLogs(
    patientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Array<{
    timestamp: string;
    accessorId: string;
    purpose: string;
    dataAccessed: string[];
  }>> {
    const queryParams = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }).toString();
    return await this.client.get(
      `${this.baseUrl}/audit-log/${patientId}${queryParams ? `?${queryParams}` : ''}`
    );
  }
}
