export enum DataCategory {
  DEMOGRAPHICS = 'demographics',
  CLINICAL_NOTES = 'clinical_notes',
  MEDICATIONS = 'medications',
  ALLERGIES = 'allergies',
  IMMUNIZATIONS = 'immunizations',
  PATHOLOGY = 'pathology',
  IMAGING = 'imaging',
  PROCEDURES = 'procedures',
  HOSPITAL_VISITS = 'hospital_visits',
  MENTAL_HEALTH = 'mental_health',
  REPRODUCTIVE_HEALTH = 'reproductive_health',
  GENETIC_INFO = 'genetic_info'
}

export enum AccessLevel {
  NONE = 'none',
  LIMITED = 'limited',
  FULL = 'full'
}

export enum ConsentPurpose {
  TREATMENT = 'treatment',
  PAYMENT = 'payment',
  HEALTHCARE_OPERATIONS = 'healthcare_operations',
  RESEARCH = 'research',
  MARKETING = 'marketing',
  OTHER = 'other'
}

export interface ConsentSetting {
  id: string;
  patientId: string;
  clinicId: string;
  clinicName: string;
  accessLevel: AccessLevel;
  dataCategories: DataCategory[];
  purposes: ConsentPurpose[];
  validFrom: string;
  validUntil?: string;
  lastUpdated: string;
  updatedBy: string;
  isActive: boolean;
  restrictions?: {
    timeRestrictions?: {
      allowedDays?: number[];
      startTime?: string;
      endTime?: string;
    };
    locationRestrictions?: string[];
    providerRestrictions?: string[];
  };
}

export interface ConsentHistory {
  id: string;
  consentId: string;
  action: 'grant' | 'revoke' | 'modify';
  timestamp: string;
  performedBy: string;
  previousState?: Partial<ConsentSetting>;
  newState: Partial<ConsentSetting>;
  reason?: string;
}

export interface ConsentRequest {
  id: string;
  requestingClinicId: string;
  requestingClinicName: string;
  patientId: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestedCategories: DataCategory[];
  requestedPurposes: ConsentPurpose[];
  requestedDuration?: number;
  notes?: string;
  responseDate?: string;
  responseNotes?: string;
}

export interface EmergencyAccess {
  id: string;
  patientId: string;
  clinicId: string;
  providerId: string;
  reason: string;
  accessedCategories: DataCategory[];
  timestamp: string;
  duration: number;
  approved?: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface DataAccessLog {
  id: string;
  patientId: string;
  accessedBy: string;
  clinicId: string;
  timestamp: string;
  accessType: 'view' | 'download' | 'share';
  dataCategory: DataCategory;
  resourceId: string;
  consentId?: string;
  emergency?: boolean;
  ipAddress: string;
  userAgent: string;
}
