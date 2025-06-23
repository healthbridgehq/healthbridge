import { APIClient } from '../api/client';
import { AuditLogEntry, SecurityContext, HealthcareIdentifier, ComplianceCheck, IdentityVerification } from '../types/security';
import { UserIdentity } from '../types/auth';
import { authService } from '../api/services/authService';

class SecurityService {
  private client: APIClient;
  private static instance: SecurityService;
  private securityContext: SecurityContext | null = null;

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Healthcare Identifiers Management
  async verifyHealthcareIdentifiers(identifiers: HealthcareIdentifier): Promise<boolean> {
    try {
      const response = await this.client.post<{ valid: boolean }>('/security/verify-identifiers', identifiers);
      await this.logAudit('verify_identifiers', 'healthcare_identifiers', identifiers.ihi || '', response.valid);
      return response.valid;
    } catch (error) {
      await this.logAudit('verify_identifiers', 'healthcare_identifiers', identifiers.ihi || '', false, error);
      throw error;
    }
  }

  // ADHA Compliance
  async checkADHACompliance(): Promise<ComplianceCheck[]> {
    return await this.client.get<ComplianceCheck[]>('/security/adha-compliance');
  }

  // Australian Privacy Principles Compliance
  async validatePrivacyCompliance(dataType: string): Promise<boolean> {
    return await this.client.post<boolean>('/security/privacy-compliance', { dataType });
  }

  // Audit Logging (ISM Requirement)
  async logAudit(
    action: string,
    resourceType: string,
    resourceId: string,
    success: boolean,
    error?: any
  ): Promise<void> {
    const user = authService.getUser();
    if (!user) throw new Error('No authenticated user for audit log');

    const entry: Partial<AuditLogEntry> = {
      timestamp: new Date().toISOString(),
      action,
      userId: user.id,
      userType: user.role as 'patient' | 'provider' | 'admin',
      resourceType,
      resourceId,
      success,
      errorDetails: error ? JSON.stringify(error) : undefined,
    };

    await this.client.post('/security/audit-log', entry);
  }

  // Identity Verification (Medicare, etc.)
  async verifyIdentity(verification: IdentityVerification): Promise<boolean> {
    try {
      const response = await this.client.post<{ verified: boolean }>('/security/verify-identity', verification);
      await this.logAudit('verify_identity', 'identity_document', verification.documentNumber, response.verified);
      return response.verified;
    } catch (error) {
      await this.logAudit('verify_identity', 'identity_document', verification.documentNumber, false, error);
      throw error;
    }
  }

  // Security Context Management
  async initializeSecurityContext(user: UserIdentity): Promise<SecurityContext> {
    const [identifiers, permissions, complianceStatus] = await Promise.all([
      this.client.get<HealthcareIdentifier>('/security/healthcare-identifiers'),
      this.client.get<string[]>('/security/permissions'),
      this.checkADHACompliance()
    ]);

    this.securityContext = {
      user,
      healthcareIdentifiers: identifiers,
      permissions,
      securityLevel: this.calculateSecurityLevel(permissions),
      mfaEnabled: user.mfaEnabled || false,
      lastPasswordChange: user.lastPasswordChange || new Date().toISOString(),
      lastSecurityAudit: new Date().toISOString(),
      complianceStatus
    };

    return this.securityContext;
  }

  // Data Sovereignty Verification
  async verifyDataLocation(): Promise<boolean> {
    const response = await this.client.get<{ location: string }>('/security/data-location');
    return response.location.startsWith('au-');
  }

  // Helper Methods
  private calculateSecurityLevel(permissions: string[]): number {
    const levelMap: Record<string, number> = {
      'admin': 5,
      'provider': 4,
      'clinic_staff': 3,
      'patient': 2,
      'guest': 1
    };

    return Math.max(...permissions.map(p => levelMap[p] || 0));
  }

  // Public Getters
  getSecurityContext(): SecurityContext | null {
    return this.securityContext;
  }

  hasPermission(permission: string): boolean {
    return this.securityContext?.permissions.includes(permission) || false;
  }
}

export const securityService = SecurityService.getInstance();
