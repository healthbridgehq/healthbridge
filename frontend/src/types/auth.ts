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
  role: 'patient' | 'provider' | 'admin' | 'clinic_staff';
  name: string;
  verified: boolean;
  mfaEnabled: boolean;
  lastPasswordChange?: string;
  ihi?: string; // Individual Healthcare Identifier
  providerNumber?: string; // Medicare Provider Number
  ahpraNumber?: string; // AHPRA Registration Number
  organizationId?: string;
}

export interface PatientRegistration {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  medicare: {
    number: string;
    referenceNumber: string;
    expiryDate: string;
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
  subspecialties?: string[];
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
  success: boolean;
  user: UserIdentity;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegistrationData extends Omit<PatientRegistration | ClinicRegistration | ProviderRegistration, 'acceptedTerms' | 'privacyConsent'> {
  acceptedTerms: boolean;
  privacyConsent: boolean;
}

export interface ResetPasswordData {
  email: string;
  token?: string;
  newPassword?: string;
}

export interface VerificationData {
  email: string;
  code: string;
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
