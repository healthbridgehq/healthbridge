export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'patient' | 'practitioner' | 'admin';
  preferences?: UserPreferences;
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
