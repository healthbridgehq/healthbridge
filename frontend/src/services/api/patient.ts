import { APIClient } from '../../api/client';
import { PatientProfile, Appointment, Prescription, HealthRecord, HealthMetric } from '../../types';

import axios from 'axios';

class PatientService {
  private static instance: PatientService;
  private client: ReturnType<typeof axios.create>;
  private readonly baseUrl: string = 'http://localhost:8000/api';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  }

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  // Profile Management
  async getProfile(): Promise<PatientProfile> {
    const response = await this.client.get<PatientProfile>(`${this.baseUrl}/profile`);
    return response.data;
  }

  async updateProfile(profile: Partial<PatientProfile>): Promise<PatientProfile> {
    const response = await this.client.put<PatientProfile>(`${this.baseUrl}/profile`, profile);
    return response.data;
  }

  // Appointments
  async getAppointments(status?: 'upcoming' | 'past' | 'all'): Promise<Appointment[]> {
    const queryParams = status ? `?status=${status}` : '';
    const response = await this.client.get<Appointment[]>(`${this.baseUrl}/appointments${queryParams}`);
    return response.data;
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const response = await this.client.get<Appointment[]>(`${this.baseUrl}/appointments/upcoming`);
    return response.data;
  }

  async bookAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const response = await this.client.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
    return response.data;
  }

  async cancelAppointment(appointmentId: string, reason: string): Promise<void> {
    await this.client.put(`${this.baseUrl}/appointments/${appointmentId}/cancel`, { reason });
  }

  // Prescriptions
  async getPrescriptions(status?: 'active' | 'expired' | 'all'): Promise<Prescription[]> {
    const queryParams = status ? `?status=${status}` : '';
    const response = await this.client.get<Prescription[]>(`${this.baseUrl}/prescriptions${queryParams}`);
    return response.data;
  }

  async requestPrescriptionRenewal(prescriptionId: string, notes?: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/prescriptions/${prescriptionId}/renew`, { notes });
  }

  // Health Records
  async getHealthSummary(): Promise<{
    conditions: Array<{ name: string; diagnosedDate: string; status: string }>;
    allergies: Array<{ substance: string; severity: string; reaction: string }>;
    medications: Array<{ name: string; dosage: string; frequency: string; status: string }>;
  }> {
    const response = await this.client.get<{
      conditions: Array<{ name: string; diagnosedDate: string; status: string }>;
      allergies: Array<{ substance: string; severity: string; reaction: string }>;
      medications: Array<{ name: string; dosage: string; frequency: string; status: string }>;
    }>(`${this.baseUrl}/health-summary`);
    return response.data;
  }

  async uploadDocument(
    file: File,
    metadata: {
      type: 'report' | 'scan' | 'prescription' | 'other';
      date: string;
      provider?: string;
      notes?: string;
    }
  ): Promise<{ documentId: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    const response = await this.client.post<{ documentId: string; url: string }>(`${this.baseUrl}/documents`, formData);
    return response.data;
  }

  async getRecentDocuments(): Promise<HealthRecord[]> {
    const response = await this.client.get<HealthRecord[]>('/recent-documents');
    return response.data;
  }

  // Medicare Integration
  async linkMedicare(details: {
    medicareNumber: string;
    irn: string;
    expiryDate: string;
  }): Promise<void> {
    await this.client.post(`${this.baseUrl}/medicare/link`, details);
  }

  async getMedicareClaims(): Promise<Array<{
    id: string;
    date: string;
    provider: string;
    service: string;
    amount: number;
    status: 'pending' | 'processed' | 'rejected';
  }>> {
    const response = await this.client.get<Array<{
      id: string;
      date: string;
      provider: string;
      service: string;
      amount: number;
      status: 'pending' | 'processed' | 'rejected';
    }>>(`${this.baseUrl}/medicare/claims`);
    return response.data;
  }

  // Notifications
  async getNotificationPreferences(): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
    types: {
      appointments: boolean;
      prescriptions: boolean;
      results: boolean;
      billing: boolean;
    };
  }> {
    const response = await this.client.get<{
      email: boolean;
      sms: boolean;
      push: boolean;
      types: {
        appointments: boolean;
        prescriptions: boolean;
        results: boolean;
        billing: boolean;
      };
    }>(`${this.baseUrl}/notifications/preferences`);
    return response.data;
  }

  async updateNotificationPreferences(preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    types?: {
      appointments?: boolean;
      prescriptions?: boolean;
      results?: boolean;
      billing?: boolean;
    };
  }): Promise<void> {
    await this.client.put(`${this.baseUrl}/notifications/preferences`, preferences);
  }

  async getClinics(): Promise<Array<{ id: string; name: string }>> {
    const response = await this.client.get<Array<{ id: string; name: string }>>(`${this.baseUrl}/clinics`);
    return response.data;
  }

  async getAvailableSlots(clinicId: string, date: string): Promise<Array<{ time: string }>> {
    const response = await this.client.get<Array<{ time: string }>>(`${this.baseUrl}/clinics/${clinicId}/slots?date=${date}`);
    return response.data;
  }

  async getHealthMetrics(): Promise<Record<string, HealthMetric>> {
    const response = await this.client.get<Record<string, HealthMetric>>(`${this.baseUrl}/health-metrics`);
    return response.data;
  }
}

export const patientService = PatientService.getInstance();

export const fetchHealthRecords = (filter?: string) => patientService.getHealthRecords(filter);
export const uploadHealthRecord = (file: File, metadata: any) => patientService.uploadHealthRecord(file, metadata);
export const deleteHealthRecord = (recordId: string) => patientService.deleteHealthRecord(recordId);
export const shareHealthRecord = (recordId: string, recipientId: string) => patientService.shareHealthRecord(recordId, recipientId);
export const fetchRecentDocuments = () => patientService.getRecentDocuments();
export const fetchUpcomingAppointments = () => patientService.getUpcomingAppointments();
export const fetchHealthMetrics = () => patientService.getHealthMetrics();
export const fetchAppointments = () => patientService.getAppointments();
export const bookAppointment = (appointment: Omit<Appointment, 'id'>) => patientService.bookAppointment(appointment);
export const cancelAppointment = (appointmentId: string) => patientService.cancelAppointment(appointmentId);
export const rescheduleAppointment = (appointmentId: string, newDetails: { date: string; time: string }) => patientService.rescheduleAppointment(appointmentId, newDetails);
export const fetchAvailableSlots = (clinicId: string, date: string) => patientService.getAvailableSlots(clinicId, date);
export const fetchClinics = () => patientService.getClinics();
