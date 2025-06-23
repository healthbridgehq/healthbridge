import { APIClient } from '@/api/client';
import { Staff, StaffVerificationStatus, Patient, Invoice } from '@/types/clinic';

interface ClinicData {
  staff: Staff[];
  patients: Patient[];
  billing: Invoice[];
}

export class StaffService {
  private readonly baseUrl = '/api/v1/clinic/staff';
  private readonly api: APIClient;

  constructor() {
    this.api = new APIClient();
  }

  async getAllStaff(): Promise<Staff[]> {
    return await this.api.get<Staff[]>(this.baseUrl);
  }

  async getStaffById(id: string): Promise<Staff> {
    return await this.api.get<Staff>(`${this.baseUrl}/${id}`);
  }

  async addStaff(staff: Omit<Staff, 'id'>): Promise<Staff> {
    return await this.api.post<Staff>(this.baseUrl, staff);
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    return await this.api.patch<Staff>(`${this.baseUrl}/${id}`, updates);
  }

  async deleteStaff(id: string): Promise<void> {
    await this.api.delete<void>(`${this.baseUrl}/${id}`);
  }

  async verifyStaff(id: string): Promise<StaffVerificationStatus> {
    return await this.api.post<StaffVerificationStatus>(`${this.baseUrl}/${id}/verify`);
  }

  async verifyAHPRA(ahpraNumber: string): Promise<boolean> {
    const response = await this.api.post<{ verified: boolean }>(`${this.baseUrl}/verify-ahpra`, {
      ahpraNumber,
    });
    return response.verified;
  }

  async verifyProviderNumber(providerNumber: string): Promise<boolean> {
    const response = await this.api.post<{ verified: boolean }>(`${this.baseUrl}/verify-provider`, {
      providerNumber,
    });
    return response.verified;
  }

  async getClinicData(): Promise<ClinicData> {
    return await this.api.get<ClinicData>('/api/v1/clinic/data');
  }
}
