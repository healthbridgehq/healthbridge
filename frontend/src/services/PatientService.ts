import { APIClient } from '../api/client';
import { PatientData, HealthRecord, Consent, Appointment, Prescription } from '../types/patient';

export class PatientService {
  private readonly baseUrl = '/api/v1/patient';
  private readonly api = APIClient.getInstance();

  async getPatientData(): Promise<PatientData> {
    try {
      return await this.api.get<PatientData>(`${this.baseUrl}/data`);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      throw error;
    }
  }

  async updatePatientData(updates: Partial<PatientData>): Promise<PatientData> {
    try {
      return await this.api.patch<PatientData>(`${this.baseUrl}/data`, updates);
    } catch (error) {
      console.error('Error updating patient data:', error);
      throw error;
    }
  }

  async getHealthRecords(): Promise<HealthRecord[]> {
    try {
      const response = await this.api.get<HealthRecord[]>(`${this.baseUrl}/health-records`);
      return response;
    } catch (error) {
      console.error('Error fetching health records:', error);
      throw error;
    }
  }

  async updateHealthRecord(record: HealthRecord): Promise<HealthRecord> {
    try {
      const response = await this.api.patch<HealthRecord>(
        `${this.baseUrl}/health-records/${record.id}`,
        record
      );
      return response;
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  }

  async shareHealthRecord(providerId: string, recordId: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/health-records/${recordId}/share`, {
      providerId,
    });
  }

  async getConsents(): Promise<Consent[]> {
    const response = await this.api.get<{ data: Consent[] }>(`${this.baseUrl}/consents`);
    return response.data;
  }

  async updateConsent(consentId: string, granted: boolean): Promise<Consent> {
    const response = await this.api.put<{ data: Consent }>(`${this.baseUrl}/consents/${consentId}`, {
      granted,
    });
    return response.data;
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await this.api.get<{ data: Appointment[] }>(`${this.baseUrl}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async bookAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
      const response = await this.api.post<Appointment>(`${this.baseUrl}/appointments`, appointmentData);
      return response;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/appointments/${appointmentId}`);
  }

  async getInvoices(): Promise<Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    status: 'pending' | 'paid' | 'overdue';
    dueDate: string;
    medicare?: {
      itemNumber: string;
      rebate: number;
      gap: number;
    };
  }>> {
    try {
      return await this.api.get<Array<{
        id: string;
        date: string;
        amount: number;
        description: string;
        status: 'pending' | 'paid' | 'overdue';
        dueDate: string;
        medicare?: {
          itemNumber: string;
          rebate: number;
          gap: number;
        };
      }>>(`${this.baseUrl}/invoices`);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async payInvoice(invoiceId: string, paymentDetails: {
    method: 'card' | 'medicare' | 'direct-debit';
    amount: number;
    cardDetails?: {
      number: string;
      expiry: string;
      cvv: string;
    };
  }): Promise<void> {
    try {
      await this.api.post(`${this.baseUrl}/invoices/${invoiceId}/pay`, paymentDetails);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url: string;
  }>> {
    try {
      const response = await this.api.get<Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        uploadDate: string;
        url: string;
      }>>(`${this.baseUrl}/documents`);
      return response;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async uploadDocument(document: FormData): Promise<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url: string;
  }> {
    try {
      const response = await this.api.post<{
        id: string;
        name: string;
        type: string;
        size: number;
        uploadDate: string;
        url: string;
      }>(`${this.baseUrl}/documents`, document);
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async shareDocument(documentId: string, providerId: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/documents/${documentId}/share`, {
      providerId,
    });
  }

  async getProviders(): Promise<Array<{
    id: string;
    name: string;
    specialty?: string;
    clinic: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
  }>> {
    try {
      const response = await this.api.get<Array<{
        id: string;
        name: string;
        specialty?: string;
        clinic: {
          id: string;
          name: string;
          address: string;
          phone: string;
        };
      }>>(`${this.baseUrl}/providers`);
      return response;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  async addProvider(providerId: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/providers`, { providerId });
  }

  async removeProvider(providerId: string): Promise<void> {
    await this.api.delete(`${this.baseUrl}/providers/${providerId}`);
  }
}
