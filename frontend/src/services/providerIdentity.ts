import { APIClient } from '../api/client';

export class ProviderIdentityService {
  private client: APIClient;
  private readonly baseUrl = '/provider';

  constructor() {
    this.client = APIClient.getInstance();
    this.baseUrl = '/provider';
  }

  /**
   * Get the provider's profile
   */
  async getProfile() {
    const response = await this.client.get<{ valid: boolean }>(`${this.baseUrl}/profile`);
    return response;
  }

  /**
   * Create a new provider profile
   */
  async createProfile(data: any) {
    const response = await this.client.post<any>(`${this.baseUrl}/profile`, data);
    return response;
  }

  /**
   * Update an existing provider profile
   */
  async updateProfile(id: string, updates: any) {
    const response = await this.client.put<{ valid: boolean }>(`${this.baseUrl}/profile/${id}`, updates);
    return response;
  }

  /**
   * Verify AHPRA registration number
   */
  async verifyAHPRA(ahpraNumber: string) {
    const response = await this.client.post<{ valid: boolean }>(
      `${this.baseUrl}/verify-ahpra`,
      { ahpraNumber }
    );
    return response.valid;
  }

  /**
   * Verify Medicare provider number
   */
  async verifyProviderNumber(providerNumber: string) {
    const response = await this.client.post<{ valid: boolean }>(
      `${this.baseUrl}/verify-provider-number`,
      { providerNumber }
    );
    return response.valid;
  }

  /**
   * Verify professional qualification
   */
  async verifyQualification(data: { degree: string; institution: string }) {
    const response = await this.client.post<{ valid: boolean }>(
      `${this.baseUrl}/verify-qualification`,
      data
    );
    return response.valid;
  }

  /**
   * Verify professional indemnity insurance
   */
  async verifyInsurance(data: { provider: string; policyNumber: string }) {
    const response = await this.client.post<{ valid: boolean }>(
      `${this.baseUrl}/verify-insurance`,
      data
    );
    return response.valid;
  }

  /**
   * Update provider privacy settings
   */
  async updatePrivacySettings(id: string, settings: any) {
    const response = await this.client.put<any>(
      `${this.baseUrl}/profile/${id}/privacy`,
      settings
    );
    return response;
  }
}

export default ProviderIdentityService;
