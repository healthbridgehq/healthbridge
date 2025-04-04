import { ApiClient } from '../api/client';

export class ProviderIdentityService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  /**
   * Get the provider's profile
   */
  async getProfile() {
    const response = await this.client.get('/provider/profile');
    return response.data;
  }

  /**
   * Create a new provider profile
   */
  async createProfile(data: any) {
    const response = await this.client.post('/provider/profile', data);
    return response.data;
  }

  /**
   * Update an existing provider profile
   */
  async updateProfile(id: string, updates: any) {
    const response = await this.client.put(`/provider/profile/${id}`, updates);
    return response.data;
  }

  /**
   * Verify AHPRA registration number
   */
  async verifyAHPRA(ahpraNumber: string) {
    const response = await this.client.post<{ valid: boolean }>(
      '/provider/verify-ahpra',
      { ahpraNumber }
    );
    return response.data;
  }

  /**
   * Verify Medicare provider number
   */
  async verifyProviderNumber(providerNumber: string) {
    const response = await this.client.post<{ valid: boolean }>(
      '/provider/verify-provider-number',
      { providerNumber }
    );
    return response.data;
  }

  /**
   * Verify professional qualification
   */
  async verifyQualification(data: { degree: string; institution: string }) {
    const response = await this.client.post<{ valid: boolean }>(
      '/provider/verify-qualification',
      data
    );
    return response.data;
  }

  /**
   * Verify professional indemnity insurance
   */
  async verifyInsurance(data: { provider: string; policyNumber: string }) {
    const response = await this.client.post<{ valid: boolean }>(
      '/provider/verify-insurance',
      data
    );
    return response.data;
  }

  /**
   * Update provider privacy settings
   */
  async updatePrivacySettings(id: string, settings: any) {
    const response = await this.client.put(
      `/provider/profile/${id}/privacy`,
      settings
    );
    return response.data;
  }
}

export default ProviderIdentityService;
