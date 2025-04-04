import { api } from './api/client';
import { Patient, ClinicProfile, ClinicStats } from '../types/clinic';

export class ClinicService {
  private readonly baseUrl = '/api/v1/clinic';

  async getClinicProfile(): Promise<ClinicProfile> {
    const response = await api.get(`${this.baseUrl}/profile`);
    return response.data;
  }

  async updateClinicProfile(updates: Partial<ClinicProfile>): Promise<ClinicProfile> {
    const response = await api.patch(`${this.baseUrl}/profile`, updates);
    return response.data;
  }

  async getClinicStats(): Promise<ClinicStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async getAllPatients(): Promise<Patient[]> {
    const response = await api.get(`${this.baseUrl}/patients`);
    return response.data;
  }

  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get(`${this.baseUrl}/patients/${id}`);
    return response.data;
  }

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const response = await api.post(`${this.baseUrl}/patients`, patient);
    return response.data;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const response = await api.patch(`${this.baseUrl}/patients/${id}`, updates);
    return response.data;
  }

  async deletePatient(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/patients/${id}`);
  }

  async verifyPatient(id: string): Promise<void> {
    await api.post(`${this.baseUrl}/patients/${id}/verify`);
  }

  async verifyMedicare(medicareNumber: string): Promise<boolean> {
    const response = await api.post(`${this.baseUrl}/verify-medicare`, {
      medicareNumber,
    });
    return response.data.verified;
  }

  async verifyIHI(ihiNumber: string): Promise<boolean> {
    const response = await api.post(`${this.baseUrl}/verify-ihi`, {
      ihiNumber,
    });
    return response.data.verified;
  }
}
