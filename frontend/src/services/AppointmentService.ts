import { APIClient } from './api/client';
import { Appointment } from '../types/patient';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DoctorAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

export class AppointmentService {
  private readonly baseUrl = '/api/v1/appointments';
  private readonly api = APIClient.getInstance();

  async getAllAppointments(): Promise<Appointment[]> {
    const response = await this.api.get(this.baseUrl);
    return response.data;
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await this.api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const response = await this.api.post(this.baseUrl, appointment);
    return response.data;
  }

  async updateAppointment(
    id: string,
    updates: Partial<Appointment>
  ): Promise<Appointment> {
    const response = await this.api.patch(`${this.baseUrl}/${id}`, updates);
    return response.data;
  }

  async cancelAppointment(id: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/${id}/cancel`);
  }

  async checkInPatient(id: string): Promise<void> {
    await this.api.post(`${this.baseUrl}/${id}/check-in`);
  }

  async getDoctorAvailability(
    doctorId: string,
    date: string
  ): Promise<DoctorAvailability> {
    const response = await this.api.get(
      `${this.baseUrl}/availability/${doctorId}?date=${date}`
    );
    return response.data;
  }

  async getAppointmentsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Appointment[]> {
    const response = await this.api.get(
      `${this.baseUrl}/range?start=${startDate}&end=${endDate}`
    );
    return response.data;
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const response = await this.api.get(`${this.baseUrl}/doctor/${doctorId}`);
    return response.data;
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const response = await this.api.get(`${this.baseUrl}/patient/${patientId}`);
    return response.data;
  }
}
