export interface HealthcareIdentifiers {
  IHI?: string; // Individual Healthcare Identifier
  HPI_I?: string; // Healthcare Provider Identifier - Individual
  HPI_O?: string; // Healthcare Provider Identifier - Organisation
}

export interface MyHealthRecordConsent {
  consentToUpload: boolean;
  consentToShare: boolean;
  consentToResearch: boolean;
  secondaryUseConsent: boolean;
  thirdPartyAccess: boolean;
  emergencyAccess: boolean;
}

export interface IdentityVerification {
  documentType: 'medicare' | 'drivers_license' | 'passport';
  documentNumber: string;
  expiryDate: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationMethod: 'dvs' | 'manual' | 'assisted';
}

export interface HealthcarePractitioner {
  title: string;
  firstName: string;
  lastName: string;
  ahpraNumber: string;
  specialties: string[];
  providerNumber: string;
  qualifications: {
    degree: string;
    institution: string;
    year: number;
  }[];
  registrationStatus: 'registered' | 'limited' | 'suspended' | 'cancelled';
  registrationExpiry: string;
  prescribingRights: boolean;
  mhrAccess: {
    level: 'full' | 'restricted' | 'none';
    restrictions?: string[];
    lastVerified: string;
  };
}

export interface HealthcareOrganisation {
  legalName: string;
  tradingName?: string;
  abn: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'pathology' | 'imaging' | 'other';
  serviceTypes: string[];
  hpio: string; // Healthcare Provider Identifier - Organisation
  accreditations: {
    type: string;
    number: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'suspended';
  }[];
  mhrParticipation: {
    status: 'active' | 'suspended' | 'terminated';
    level: 'full' | 'restricted' | 'none';
    lastVerified: string;
    securityPolicyLastReviewed: string;
    authorizedUsers: {
      hpiI: string;
      role: string;
      accessLevel: string;
    }[];
  };
  locations: {
    type: 'primary' | 'branch';
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
    phone: string;
    fax?: string;
    email: string;
    operatingHours: {
      [key: string]: {
        open: string;
        close: string;
      };
    };
  }[];
  contacts: {
    type: 'primary' | 'technical' | 'clinical' | 'billing';
    name: string;
    position: string;
    phone: string;
    email: string;
  }[];
  compliance: {
    privacyPolicy: boolean;
    dataBreachPlan: boolean;
    securityPolicy: boolean;
    lastAuditDate?: string;
    certifications: {
      type: string;
      issueDate: string;
      expiryDate: string;
    }[];
  };
  insurance: {
    provider: string;
    policyNumber: string;
    coverage: string;
    expiryDate: string;
  };
}

export interface PatientHealthProfile {
  ihi: string; // Individual Healthcare Identifier
  medicareDetails: {
    number: string;
    irn: string; // Individual Reference Number
    expiryDate: string;
  };
  myHealthRecord: {
    status: 'active' | 'inactive' | 'suspended';
    accessCode?: string;
    consentSettings: MyHealthRecordConsent;
    lastUpdated: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    hasAccessRights: boolean;
  };
  representativeDetails?: {
    type: 'parent' | 'guardian' | 'carer' | 'power_of_attorney';
    name: string;
    relationship: string;
    phone: string;
    email: string;
    documentationProvided: boolean;
    accessLevel: 'full' | 'restricted';
    startDate: string;
    endDate?: string;
  };
  clinicalDetails: {
    allergies: {
      substance: string;
      reaction: string;
      severity: string;
      status: 'active' | 'inactive';
    }[];
    conditions: {
      condition: string;
      status: 'active' | 'resolved' | 'inactive';
      diagnosedDate: string;
      notes?: string;
    }[];
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
      endDate?: string;
      prescribedBy: string;
    }[];
  };
}
