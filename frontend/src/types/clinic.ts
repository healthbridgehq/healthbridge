export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  email: string;
  phone: string;
  status: StaffStatus;
  specialties: string[];
  ahpraNumber?: string;
  providerNumber?: string;
  verificationStatus: StaffVerificationStatus;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  medicare: string;
  ihi: string;
  status: PatientStatus;
  lastVisit: string;
  upcomingAppointment?: string;
  medicalConditions: string[];
  assignedDoctor: string;
}

export interface ClinicProfile {
  id: string;
  name: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  businessHours: BusinessHours[];
  practiceNumber: string;
  billingDetails: BillingDetails;
  settings: ClinicSettings;
}

export interface ClinicStats {
  todayAppointments: number;
  pendingRequests: number;
  activePatients: number;
  totalRevenue: number;
  upcomingAppointments: Appointment[];
  recentMessages: Message[];
  patientFlow: PatientFlow[];
}

export interface Address {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BillingDetails {
  abn: string;
  bankName: string;
  accountName: string;
  bsb: string;
  accountNumber: string;
  medicare: {
    providerNumber: string;
    locationId: string;
  };
}

export interface ClinicSettings {
  appointmentDuration: number;
  reminderSettings: {
    sms: boolean;
    email: boolean;
    advanceHours: number;
  };
  billingSettings: {
    bulkBilling: boolean;
    privateBilling: boolean;
    gapPayment: number;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  billingStatus: BillingStatus;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
}

export interface PatientFlow {
  hour: string;
  scheduled: number;
  actual: number;
}

export type StaffRole =
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'Practice Manager'
  | 'Allied Health'
  | 'Administrator';

export type StaffStatus = 'active' | 'inactive' | 'pending';

export type PatientStatus = 'active' | 'inactive' | 'pending';

export type AppointmentType =
  | 'Standard Consultation'
  | 'Long Consultation'
  | 'Telehealth'
  | 'Follow Up'
  | 'Procedure';

export type AppointmentStatus =
  | 'scheduled'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type BillingStatus =
  | 'not-billed'
  | 'bulk-billed'
  | 'private-billed'
  | 'paid'
  | 'overdue';

export interface StaffVerificationStatus {
  ahpra: boolean;
  identity: boolean;
  qualifications: boolean;
}
