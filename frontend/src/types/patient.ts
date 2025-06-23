export interface PatientData {
  profile: PatientProfile;
  healthRecords: HealthRecord[];
  consents: Consent[];
  appointments: Appointment[];
  prescriptions: Prescription[];
}

export interface HealthRecord {
  id: string;
  patientId: string;
  type: 'condition' | 'procedure' | 'test' | 'vaccination' | 'note';
  title: string;
  description: string;
  date: string;
  provider: {
    id: string;
    name: string;
    specialty?: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  shared: Array<{
    providerId: string;
    sharedDate: string;
  }>;
  status: 'active' | 'completed' | 'cancelled';
  followUp?: {
    required: boolean;
    date?: string;
    notes?: string;
  };
}

export interface Consent {
  id: string;
  patientId: string;
  type: 'provider-access' | 'data-sharing' | 'research' | 'communication';
  provider?: {
    id: string;
    name: string;
    specialty?: string;
  };
  purpose: string;
  granted: boolean;
  dateGranted?: string;
  dateRevoked?: string;
  expiry?: string;
  scope: Array<'profile' | 'appointments' | 'prescriptions' | 'health-records' | 'billing'>;
}

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  medicare: {
    number: string;
    irn: string;
    expiryDate: string;
    verified: boolean;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  preferredLanguage?: string;
  culturalBackground?: string;
  preferredCommunication: 'email' | 'phone' | 'sms';
  allergies: Array<{
    substance: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction: string;
  }>;
  medicalConditions: Array<{
    condition: string;
    diagnosedDate: string;
    status: 'active' | 'resolved' | 'managed';
    notes?: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
  }>;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  dateTime: string;
  duration: number;
  type: 'consultation' | 'followup' | 'procedure' | 'telehealth';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  medicare: {
    eligible: boolean;
    itemNumber?: string;
    bulkBilled: boolean;
  };
  reminders: {
    email: boolean;
    sms: boolean;
    reminderSent: boolean;
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  providerId: string;
  medication: {
    name: string;
    strength: string;
    form: string;
    directions: string;
    quantity: number;
    repeats: number;
    pbs?: {
      code: string;
      benefit: number;
    };
  };
  dateIssued: string;
  dateExpiry: string;
  status: 'active' | 'expired' | 'cancelled';
  dispensing: Array<{
    date: string;
    pharmacy: string;
    quantity: number;
    remaining: number;
  }>;
  notes?: string;
}
