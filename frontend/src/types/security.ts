import { UserIdentity } from './auth';

export interface HealthcareIdentifier {
  ihi?: string;  // Individual Healthcare Identifier
  hpiI?: string; // Healthcare Provider Identifier - Individual
  hpiO?: string; // Healthcare Provider Identifier - Organisation
  providerNumber?: string; // Medicare Provider Number
}

export interface SecurityConfig {
  dataCenter: 'au-east' | 'au-west';
  encryptionKey: string;
  apiVersion: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  userId: string;
  userType: 'patient' | 'provider' | 'admin';
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  success: boolean;
  errorDetails?: string;
}

export interface IdentityVerification {
  documentType: 'medicare' | 'drivers_license' | 'passport';
  documentNumber: string;
  expiryDate?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationMethod: 'automated' | 'manual';
  verificationTimestamp?: string;
}

export interface ComplianceCheck {
  type: 'APP' | 'ADHA' | 'ISM' | 'StatePrivacy';
  status: 'compliant' | 'non_compliant' | 'pending';
  lastChecked: string;
  details: Record<string, any>;
  remediationRequired?: boolean;
  remediationSteps?: string[];
}

export interface DataRetentionPolicy {
  dataType: string;
  retentionPeriod: number; // in months
  disposalMethod: 'deletion' | 'archival' | 'anonymization';
  legalBasis: string;
  lastReviewDate: string;
}

export interface SecurityContext {
  user: UserIdentity;
  healthcareIdentifiers: HealthcareIdentifier;
  permissions: string[];
  securityLevel: number;
  mfaEnabled: boolean;
  lastPasswordChange: string;
  lastSecurityAudit: string;
  complianceStatus: ComplianceCheck[];
}
