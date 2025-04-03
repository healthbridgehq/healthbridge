import { MyHealthRecordConsent } from './healthcare';

export interface PatientNote {
  id: string;
  createdAt: string;
  updatedAt: string;
  clinicId: string;
  providerId: string;
  content: string;
  aiSummary?: string;
  tags: string[];
  visibility: 'patient' | 'clinic' | 'encrypted';
  nextSteps?: string[];
  followUpDate?: string;
}

export interface MedicalHistory {
  condition: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'recurring';
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
  treatingProvider?: string;
  treatments?: string[];
  documents?: HealthDocument[];
}

export interface FamilyHistory {
  relationship: string;
  condition: string;
  diagnosedAge?: number;
  notes?: string;
  relevantTo?: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  reason: string;
  sideEffects?: string[];
  interactions?: string[];
  status: 'active' | 'discontinued' | 'completed';
}

export interface HealthDocument {
  id: string;
  type: 'report' | 'scan' | 'prescription' | 'referral' | 'other';
  title: string;
  date: string;
  provider: string;
  facility: string;
  encryptedContent: string;
  encryptionKey?: string;
  sharedWith: string[];
  visibility: 'patient' | 'clinic' | 'encrypted';
}

export interface NextOfKin {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  hasEmergencyAccess: boolean;
  canReceiveUpdates: boolean;
}

export interface PatientAddress {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  type: 'home' | 'postal' | 'work';
  isPrimary: boolean;
}

export interface AiGeneratedInsight {
  id: string;
  generatedAt: string;
  type: 'summary' | 'alert' | 'recommendation' | 'trend';
  content: string;
  confidence: number;
  sources: string[];
  requiresReview: boolean;
  reviewedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DataSharingConsent {
  clinicId: string;
  grantedAt: string;
  expiresAt?: string;
  dataTypes: string[];
  purpose: string;
  accessLevel: 'full' | 'partial' | 'emergency';
  encryptionKeys?: {
    publicKey: string;
    encryptedPrivateKey?: string;
  };
}

export interface ComprehensivePatientRecord {
  patientId: string;
  personalInfo: {
    title?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    pronouns?: string;
    email: string;
    phone: string;
    preferredContactMethod: 'email' | 'phone' | 'sms';
    preferredLanguage: string;
    interpreter?: boolean;
  };
  addresses: PatientAddress[];
  nextOfKin: NextOfKin[];
  emergencyContacts: NextOfKin[];
  
  // Health Information
  medicalHistory: MedicalHistory[];
  familyHistory: FamilyHistory[];
  medications: Medication[];
  allergies: {
    substance: string;
    reaction: string;
    severity: string;
    diagnosed: string;
  }[];
  immunizations: {
    vaccine: string;
    date: string;
    provider: string;
    nextDue?: string;
  }[];
  
  // Clinical Notes & Documents
  notes: PatientNote[];
  documents: HealthDocument[];
  
  // AI Insights
  aiInsights: AiGeneratedInsight[];
  
  // Sharing & Consent
  dataSharingConsents: DataSharingConsent[];
  mhrConsent: MyHealthRecordConsent;
  
  // Care Plan
  carePlan: {
    goals: {
      description: string;
      targetDate?: string;
      status: 'active' | 'completed' | 'cancelled';
      progress?: number;
    }[];
    upcomingAppointments: {
      date: string;
      provider: string;
      purpose: string;
      facility: string;
      status: 'scheduled' | 'confirmed' | 'cancelled';
    }[];
    referrals: {
      to: string;
      reason: string;
      date: string;
      status: 'pending' | 'accepted' | 'completed';
    }[];
  };
  
  // Audit & Security
  lastUpdated: string;
  updatedBy: string;
  accessLog: {
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    reason?: string;
  }[];
}
