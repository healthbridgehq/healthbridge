import { APIClient } from '../api/client';
import { securityService } from './security';
import { HealthcareIdentifier, IdentityVerification } from '../types/security';
import { UserIdentity } from '../types/auth';

interface PatientProfile {
  id: string;
  ihi: string;
  medicareNumber: string;
  medicareIRN: string;
  medicareExpiryDate: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    indigenousStatus?: string;
    culturalBackground?: string;
    preferredLanguage: string;
    interpreterRequired: boolean;
  };
  contactDetails: {
    email: string;
    phone: string;
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  healthSummary: {
    allergies: Array<{
      substance: string;
      reaction: string;
      severity: 'mild' | 'moderate' | 'severe';
      verified: boolean;
    }>;
    conditions: Array<{
      condition: string;
      diagnosedDate: string;
      status: 'active' | 'resolved';
      verified: boolean;
    }>;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy: string;
      startDate: string;
      endDate?: string;
      active: boolean;
    }>;
  };
  privacySettings: {
    consentStatus: 'granted' | 'partial' | 'withdrawn';
    dataSharing: {
      myHealthRecord: boolean;
      researchParticipation: boolean;
      thirdPartyAccess: boolean;
    };
    restrictions?: Array<{
      providerType: string;
      restrictionType: 'full' | 'partial' | 'none';
      notes?: string;
    }>;
  };
}

class PatientIdentityService {
  private client: APIClient;
  private static instance: PatientIdentityService;

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): PatientIdentityService {
    if (!PatientIdentityService.instance) {
      PatientIdentityService.instance = new PatientIdentityService();
    }
    return PatientIdentityService.instance;
  }

  // IHI Management
  async verifyIHI(ihi: string): Promise<boolean> {
    try {
      const response = await this.client.post<{ valid: boolean }>('/identity/verify-ihi', { ihi });
      await securityService.logAudit('verify_ihi', 'healthcare_identifier', ihi, response.valid);
      return response.valid;
    } catch (error) {
      await securityService.logAudit('verify_ihi', 'healthcare_identifier', ihi, false, error);
      throw error;
    }
  }

  // Medicare Verification
  async verifyMedicare(details: {
    number: string;
    irn: string;
    expiryDate: string;
  }): Promise<boolean> {
    try {
      const response = await this.client.post<{ valid: boolean }>('/identity/verify-medicare', details);
      await securityService.logAudit('verify_medicare', 'medicare', details.number, response.valid);
      return response.valid;
    } catch (error) {
      await securityService.logAudit('verify_medicare', 'medicare', details.number, false, error);
      throw error;
    }
  }

  // Profile Management
  async createProfile(profile: Omit<PatientProfile, 'id'>): Promise<PatientProfile> {
    // Verify IHI first
    const ihiValid = await this.verifyIHI(profile.ihi);
    if (!ihiValid) {
      throw new Error('Invalid IHI provided');
    }

    // Verify Medicare details
    const medicareValid = await this.verifyMedicare({
      number: profile.medicareNumber,
      irn: profile.medicareIRN,
      expiryDate: profile.medicareExpiryDate,
    });
    if (!medicareValid) {
      throw new Error('Invalid Medicare details provided');
    }

    // Create profile with verified details
    const response = await this.client.post<PatientProfile>('/identity/create-profile', profile);
    await securityService.logAudit('create_profile', 'patient_profile', response.id, true);
    return response;
  }

  async updateProfile(id: string, updates: Partial<PatientProfile>): Promise<PatientProfile> {
    // If updating identifiers, verify them first
    if (updates.ihi) {
      const ihiValid = await this.verifyIHI(updates.ihi);
      if (!ihiValid) {
        throw new Error('Invalid IHI provided');
      }
    }

    if (updates.medicareNumber || updates.medicareIRN || updates.medicareExpiryDate) {
      const medicareValid = await this.verifyMedicare({
        number: updates.medicareNumber || '',
        irn: updates.medicareIRN || '',
        expiryDate: updates.medicareExpiryDate || '',
      });
      if (!medicareValid) {
        throw new Error('Invalid Medicare details provided');
      }
    }

    const response = await this.client.put<PatientProfile>(`/identity/update-profile/${id}`, updates);
    await securityService.logAudit('update_profile', 'patient_profile', id, true);
    return response;
  }

  async getProfile(id: string): Promise<PatientProfile> {
    return await this.client.get<PatientProfile>(`/identity/profile/${id}`);
  }

  // Consent Management
  async updatePrivacySettings(
    id: string,
    settings: PatientProfile['privacySettings']
  ): Promise<void> {
    await this.client.put(`/identity/privacy-settings/${id}`, settings);
    await securityService.logAudit('update_privacy', 'privacy_settings', id, true);
  }

  // Document Verification
  async verifyIdentityDocuments(
    id: string,
    documents: IdentityVerification[]
  ): Promise<boolean> {
    try {
      const response = await this.client.post<{ verified: boolean }>(
        `/identity/verify-documents/${id}`,
        { documents }
      );
      await securityService.logAudit('verify_documents', 'identity_documents', id, response.verified);
      return response.verified;
    } catch (error) {
      await securityService.logAudit('verify_documents', 'identity_documents', id, false, error);
      throw error;
    }
  }

  // Healthcare Provider Access Management
  async grantProviderAccess(
    patientId: string,
    providerId: string,
    accessLevel: 'full' | 'partial' | 'emergency'
  ): Promise<void> {
    await this.client.post(`/identity/provider-access/${patientId}`, {
      providerId,
      accessLevel,
    });
    await securityService.logAudit('grant_access', 'provider_access', `${patientId}-${providerId}`, true);
  }

  async revokeProviderAccess(patientId: string, providerId: string): Promise<void> {
    await this.client.delete(`/identity/provider-access/${patientId}/${providerId}`);
    await securityService.logAudit('revoke_access', 'provider_access', `${patientId}-${providerId}`, true);
  }

  // Audit Trail
  async getIdentityAuditTrail(id: string): Promise<Array<{
    timestamp: string;
    action: string;
    performedBy: string;
    details: any;
  }>> {
    return await this.client.get(`/identity/audit-trail/${id}`);
  }
}

export const patientIdentityService = PatientIdentityService.getInstance();
