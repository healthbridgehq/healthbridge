// FHIR R4 Resource Types
export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface Patient extends FHIRResource {
  resourceType: 'Patient';
  identifier: Array<{
    system: string; // IHI system URL
    value: string; // IHI number
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
  active: boolean;
  name: Array<{
    use?: string;
    family: string;
    given: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
  gender?: string;
  birthDate?: string;
  address?: Array<{
    use?: string;
    type?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  contact?: Array<{
    relationship?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    name?: {
      family: string;
      given: string[];
    };
    telecom?: Array<{
      system: string;
      value: string;
    }>;
  }>;
}

export interface Observation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string; // SNOMED CT-AU
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string; // Reference to Patient
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
}

export interface Medication extends FHIRResource {
  resourceType: 'Medication';
  code: {
    coding: Array<{
      system: string; // AMT URL
      code: string;
      display: string;
    }>;
  };
  status: 'active' | 'inactive' | 'entered-in-error';
  manufacturer?: {
    reference: string;
  };
  form?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
}

export interface MedicationStatement extends FHIRResource {
  resourceType: 'MedicationStatement';
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold' | 'unknown' | 'not-taken';
  medicationReference: {
    reference: string; // Reference to Medication
  };
  subject: {
    reference: string; // Reference to Patient
  };
  effectiveDateTime?: string;
  dateAsserted: string;
  informationSource?: {
    reference: string; // Reference to Patient or Practitioner
  };
  dosage?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseQuantity?: {
      value: number;
      unit: string;
      system: string;
      code: string;
    };
  }>;
}

// Australian Healthcare Identifiers
export interface HealthcareIdentifiers {
  IHI?: string; // Individual Healthcare Identifier
  HPI_I?: string; // Healthcare Provider Identifier - Individual
  HPI_O?: string; // Healthcare Provider Identifier - Organisation
}
