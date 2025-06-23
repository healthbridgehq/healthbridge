export type { Appointment, ClinicMetrics } from './clinicService';
export { fetchTodayAppointments, fetchClinicMetrics } from './clinicService';

export type { Patient } from './patientService';
export { fetchRecentPatients } from './patientService';

export type { BillingOverview } from './billingService';
export { fetchBillingOverview } from './billingService';
