import { APIClient } from '../api/client';
import { Patient, ClinicProfile, ClinicStats, Appointment } from '../types/clinic';

export class ClinicService {
  private readonly client: APIClient;
  private readonly baseUrl = '/api/v1/clinic';
  private static instance: ClinicService;

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): ClinicService {
    if (!ClinicService.instance) {
      ClinicService.instance = new ClinicService();
    }
    return ClinicService.instance;
  }

  async getClinicProfile(): Promise<ClinicProfile> {
    return await this.client.get(`${this.baseUrl}/profile`);
  }

  async updateClinicProfile(updates: Partial<ClinicProfile>): Promise<ClinicProfile> {
    return await this.client.patch(`${this.baseUrl}/profile`, updates);
  }

  async getClinicStats(): Promise<ClinicStats> {
    return await this.client.get(`${this.baseUrl}/stats`);
  }

  async getAllPatients(): Promise<Patient[]> {
    return await this.client.get(`${this.baseUrl}/patients`);
  }

  async getPatientById(id: string): Promise<Patient> {
    return await this.client.get(`${this.baseUrl}/patients/${id}`);
  }

  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    return await this.client.post(`${this.baseUrl}/patients`, patient);
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    return await this.client.patch(`${this.baseUrl}/patients/${id}`, updates);
  }

  async deletePatient(id: string): Promise<void> {
    await this.client.delete(`${this.baseUrl}/patients/${id}`);
  }

  async verifyPatient(id: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/patients/${id}/verify`);
  }

  async verifyMedicare(medicareNumber: string): Promise<boolean> {
    const response = await this.client.post<{ verified: boolean }>(`${this.baseUrl}/verify-medicare`, {
      medicareNumber,
    });
    return response.verified;
  }

  async verifyIHI(ihiNumber: string): Promise<boolean> {
    const response = await this.client.post<{ verified: boolean }>(`${this.baseUrl}/verify-ihi`, {
      ihiNumber,
    });
    return response.verified;
  }

  async getAppointments(): Promise<Appointment[]> {
    const response = await this.client.get<{ data: Appointment[] }>(`${this.baseUrl}/appointments`);
    return response.data;
  }

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const response = await this.client.post<{ data: Appointment }>(`${this.baseUrl}/appointments`, appointment);
    return response.data;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const response = await this.client.patch<{ data: Appointment }>(`${this.baseUrl}/appointments/${id}`, updates);
    return response.data;
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.client.delete(`${this.baseUrl}/appointments/${id}`);
  }
}
