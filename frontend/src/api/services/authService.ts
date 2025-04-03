import { APIClient } from '../client';
import {
  UserIdentity,
  AuthResponse,
  PatientRegistration,
  ClinicRegistration,
  ProviderRegistration,
  VerificationRequest,
  VerificationResponse,
} from '../../types/auth';

class AuthService {
  private client: APIClient;
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_identity';

  constructor() {
    this.client = APIClient.getInstance();
  }

  // Patient Registration Flow
  async registerPatient(data: PatientRegistration): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/register/patient',
      data
    );
    this.handleAuthResponse(response);
    return response;
  }

  // Clinic Registration Flow
  async registerClinic(data: ClinicRegistration): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/register/clinic',
      data
    );
    this.handleAuthResponse(response);
    return response;
  }

  // Healthcare Provider Registration Flow
  async registerProvider(data: ProviderRegistration): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      '/auth/register/provider',
      data
    );
    this.handleAuthResponse(response);
    return response;
  }

  // Verification Endpoints
  async requestVerification(request: VerificationRequest): Promise<VerificationResponse> {
    return await this.client.post('/auth/verify/request', request);
  }

  async submitVerification(request: VerificationRequest): Promise<VerificationResponse> {
    return await this.client.post('/auth/verify/submit', request);
  }

  async validateIdentityDocument(
    type: string,
    documentData: any
  ): Promise<{ valid: boolean; message?: string }> {
    return await this.client.post('/auth/verify/identity', {
      type,
      documentData,
    });
  }

  // Authentication
  async login(
    email: string,
    password: string,
    mfaCode?: string
  ): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
      mfaCode,
    });
    this.handleAuthResponse(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    this.handleAuthResponse(response);
    return response;
  }

  // Password Management
  async requestPasswordReset(email: string): Promise<void> {
    await this.client.post('/auth/password/reset-request', { email });
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    await this.client.post('/auth/password/reset', {
      token,
      newPassword,
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.client.post('/auth/password/change', {
      currentPassword,
      newPassword,
    });
  }

  // MFA Management
  async enableMFA(
    method: 'app' | 'sms'
  ): Promise<{ secret?: string; qrCode?: string }> {
    return await this.client.post('/auth/mfa/enable', { method });
  }

  async verifyMFA(code: string): Promise<{ success: boolean }> {
    return await this.client.post('/auth/mfa/verify', { code });
  }

  async disableMFA(code: string): Promise<void> {
    await this.client.post('/auth/mfa/disable', { code });
  }

  // Session Management
  async getCurrentUser(): Promise<UserIdentity | null> {
    try {
      const response = await this.client.get<UserIdentity>('/auth/me');
      this.setUser(response);
      return response;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }

  // Local Storage Management
  private handleAuthResponse(response: AuthResponse): void {
    this.setTokens(response.accessToken, response.refreshToken);
    this.setUser(response.user);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, accessToken);
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, refreshToken);
  }

  private setUser(user: UserIdentity): void {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AuthService.TOKEN_KEY);
  }

  getUser(): UserIdentity | null {
    const user = localStorage.getItem(AuthService.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  getAuthHeader(): { Authorization: string } | undefined {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

export const authService = new AuthService();
