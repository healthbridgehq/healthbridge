import { api } from './api/client';
import { Staff, StaffVerificationStatus } from '../types/clinic';

export class StaffService {
  private readonly baseUrl = '/api/v1/clinic/staff';

  async getAllStaff(): Promise<Staff[]> {
    const response = await api.get(this.baseUrl);
    return response.data;
  }

  async getStaffById(id: string): Promise<Staff> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async addStaff(staff: Omit<Staff, 'id'>): Promise<Staff> {
    const response = await api.post(this.baseUrl, staff);
    return response.data;
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const response = await api.patch(`${this.baseUrl}/${id}`, updates);
    return response.data;
  }

  async deleteStaff(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async verifyStaff(id: string): Promise<StaffVerificationStatus> {
    const response = await api.post(`${this.baseUrl}/${id}/verify`);
    return response.data;
  }

  async verifyAHPRA(ahpraNumber: string): Promise<boolean> {
    const response = await api.post(`${this.baseUrl}/verify-ahpra`, {
      ahpraNumber,
    });
    return response.data.verified;
  }

  async verifyProviderNumber(providerNumber: string): Promise<boolean> {
    const response = await api.post(`${this.baseUrl}/verify-provider`, {
      providerNumber,
    });
    return response.data.verified;
  }
}
