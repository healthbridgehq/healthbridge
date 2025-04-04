import { APIClient } from './api/client';
import { PatientData, HealthRecord, Consent } from '../types/patient';

export class PatientService {
  private readonly baseUrl = '/api/v1/patient';
  private readonly api = APIClient.getInstance();

  async getPatientData(): Promise<PatientData> {
    const response = await this.api.get(`${this.baseUrl}/data`);
    return response.data;
  }

  async updatePatientData(updates: Partial<PatientData>): Promise<PatientData> {
    const response = await this.api.patch(`${this.baseUrl}/data`, updates);
    return response.data;
  }

  async getHealthRecords(): Promise<HealthRecord[]> {
    const response = await this.api.get(`${this.baseUrl}/health-records`);
    return response.data;
  }

  async updateHealthRecord(record: HealthRecord): Promise<HealthRecord> {
    const response = await this.api.patch(
      `${this.baseUrl}/health-records/${record.id}`,
      record
    );
    return response.data;
  }

  async shareHealthRecord(providerId: string, recordId: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/health-records/${recordId}/share`, {
      providerId,
    });
  }

  async getConsents(): Promise<Consent[]> {
    const response = await this.api.get(`${this.baseUrl}/consents`);
    return response.data;
  }

  async updateConsent(consentId: string, granted: boolean): Promise<Consent> {
    const response = await this.api.patch(`${this.baseUrl}/consents/${consentId}`, {
      granted,
    });
    return response.data;
  }

  async getAppointments(): Promise<any[]> {
    const response = await this.api.get(`${this.baseUrl}/appointments`);
    return response.data;
  }

  async bookAppointment(appointmentData: any): Promise<any> {
    const response = await this.api.post(`${this.baseUrl}/appointments`, appointmentData);
    return response.data;
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/appointments/${appointmentId}`);
  }

  async getInvoices(): Promise<any[]> {
    const response = await this.api.get(`${this.baseUrl}/invoices`);
    return response.data;
  }

  async payInvoice(invoiceId: string, paymentDetails: any): Promise<void> {
    await this.api.post(`${this.baseUrl}/invoices/${invoiceId}/pay`, paymentDetails);
  }

  async getDocuments(): Promise<any[]> {
    const response = await this.api.get(`${this.baseUrl}/documents`);
    return response.data;
  }

  async uploadDocument(document: FormData): Promise<any> {
    const response = await this.api.post(`${this.baseUrl}/documents`, document);
    return response.data;
  }

  async shareDocument(documentId: string, providerId: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/documents/${documentId}/share`, {
      providerId,
    });
  }

  async getProviders(): Promise<any[]> {
    const response = await this.api.get(`${this.baseUrl}/providers`);
    return response.data;
  }

  async addProvider(providerId: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/providers`, { providerId });
  }

  async removeProvider(providerId: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/providers/${providerId}`);
  }
}
