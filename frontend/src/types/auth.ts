export enum UserRole {
  PATIENT = 'patient',
  CLINIC_ADMIN = 'clinic_admin',
  CLINIC_STAFF = 'clinic_staff',
  HEALTHCARE_PROVIDER = 'healthcare_provider',
  SYSTEM_ADMIN = 'system_admin'
}

export enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
  IDENTITY = 'identity',
  PROVIDER_NUMBER = 'provider_number',
  CLINIC_REGISTRATION = 'clinic_registration'
}

export enum IdentityDocumentType {
  MEDICARE_CARD = 'medicare_card',
  DRIVERS_LICENSE = 'drivers_license',
  PASSPORT = 'passport',
  AHPRA_REGISTRATION = 'ahpra_registration'
}

export interface UserIdentity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'clinic';
  phoneNumber?: string;
  verified: {
    email: boolean;
    phone?: boolean;
    identity?: boolean;
    provider?: boolean;
  };
  mfaEnabled: boolean;
  mfaMethod?: 'app' | 'sms';
  lastLogin?: string;
  lastPasswordChange?: string;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    timezone: string;
  };
  status: 'active' | 'pending' | 'suspended' | 'deactivated';
}

export interface PatientRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  medicareNumber: string;
  medicareIRN: string; // Individual Reference Number
  medicareExpiryDate: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  acceptedTerms: boolean;
  privacyConsent: boolean;
}

export interface ClinicRegistration {
  businessName: string;
  tradingName?: string;
  abn: string;
  providerNumber?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  primaryContact: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phone: string;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  services: string[];
  accreditations: {
    type: string;
    number: string;
    expiryDate: string;
  }[];
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  acceptedTerms: boolean;
  privacyConsent: boolean;
}

export interface ProviderRegistration {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ahpraNumber: string;
  providerNumber: string;
  specialties: string[];
  qualifications: {
    degree: string;
    institution: string;
    year: number;
  }[];
  clinicAffiliations?: {
    clinicId: string;
    role: string;
    startDate: string;
  }[];
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  acceptedTerms: boolean;
  privacyConsent: boolean;
}

export interface AuthResponse {
  user: UserIdentity;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface VerificationRequest {
  type: VerificationType;
  identifier: string; // email, phone, etc.
  code?: string;
  documentType?: IdentityDocumentType;
  documentData?: any;
}

export interface VerificationResponse {
  success: boolean;
  nextStep?: VerificationType;
  expiresIn?: number;
  attempts?: number;
  message?: string;
}
