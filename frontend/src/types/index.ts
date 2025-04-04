export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'patient' | 'practitioner' | 'admin';
  preferences?: UserPreferences;
  age?: number;
  gender?: string;
  conditions?: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
}

export interface HealthRecord {
  source: string;
  fileUrl: string;
  sharedWith: string[];
  id: string;
  title: string;
  description: string;
  type: 'consultation' | 'test' | 'prescription' | 'other';
  date: string;
  provider: string;
  attachments?: Attachment[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  dateAdded: string;
  patientId: string;
  practitionerId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Consent {
  id: string;
  patientId: string;
  practitionerId: string;
  status: 'pending' | 'approved' | 'denied' | 'revoked';
  type: 'view' | 'edit' | 'full';
  scope: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError extends Error {
  code: string;
  status: number;
  data?: any;
}

export interface StoreState {
  user: User | null;
  healthRecords: HealthRecord[];
  consents: Consent[];
  loading: boolean;
  error: ApiError | null;
}

export interface Metric {
  label: string;
  value: number;
  trend?: string;
  unit?: string;
  status?: 'good' | 'warning' | 'error';
}

export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ClinicalInsights {
  metrics: Metric[];
  trends: Array<{
    date: string;
    value: number;
  }>;
}

export interface PopulationHealth {
  riskDistribution: RiskDistribution[];
  trends: Array<{
    date: string;
    value: number;
  }>;
  segments: Array<{
    name: string;
    value: number;
  }>;
}

export interface OperationalMetrics {
  performance: Metric[];
  efficiency: Array<{
    date: string;
    value: number;
  }>;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'warning' | 'info';
  category: string;
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

export interface Appointment {
  slot: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  id: string;
  type: string;
  date: string;
  time: string;
  clinic: {
    id: string;
    name: string;
  };
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  trend?: number;
}

export type StoreAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_HEALTH_RECORDS'; payload: HealthRecord[] }
  | { type: 'ADD_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'UPDATE_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'DELETE_HEALTH_RECORD'; payload: string }
  | { type: 'SET_CONSENTS'; payload: Consent[] }
  | { type: 'ADD_CONSENT'; payload: Consent }
  | { type: 'UPDATE_CONSENT'; payload: Consent }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ApiError | null };
