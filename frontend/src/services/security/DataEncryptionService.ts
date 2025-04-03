import { APIClient } from '../../api/apiClient';

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

class DataEncryptionService {
  private static instance: DataEncryptionService;
  private client: APIClient;
  private readonly baseUrl: string = 'https://api.healthbridge-au.com/encryption';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): DataEncryptionService {
    if (!DataEncryptionService.instance) {
      DataEncryptionService.instance = new DataEncryptionService();
    }
    return DataEncryptionService.instance;
  }

  // Key Management
  async rotateEncryptionKeys(): Promise<void> {
    await this.client.post(`${this.baseUrl}/keys/rotate`, {});
  }

  async generateDataKey(): Promise<{ keyId: string }> {
    return await this.client.post<{ keyId: string }>(`${this.baseUrl}/keys/generate`, {});
  }

  // Data Encryption
  async encryptData(data: any, keyId: string): Promise<EncryptedData> {
    return await this.client.post<EncryptedData>(`${this.baseUrl}/encrypt`, {
      data,
      keyId,
    });
  }

  async decryptData(encryptedData: EncryptedData, keyId: string): Promise<any> {
    return await this.client.post(`${this.baseUrl}/decrypt`, {
      ...encryptedData,
      keyId,
    });
  }

  // Secure Storage
  async storeSecurely(key: string, value: any): Promise<void> {
    const encryptedData = await this.encryptData(value, 'current');
    await this.client.post(`${this.baseUrl}/store`, {
      key,
      ...encryptedData,
    });
  }

  async retrieveSecurely(key: string): Promise<any> {
    const response = await this.client.get<EncryptedData>(`${this.baseUrl}/retrieve/${key}`);
    return await this.decryptData(response, 'current');
  }

  // Transport Security
  async establishSecureChannel(targetEndpoint: string): Promise<{ channelId: string; sessionKey: string }> {
    return await this.client.post(`${this.baseUrl}/channel`, {
      endpoint: targetEndpoint,
    });
  }

  async closeSecureChannel(channelId: string): Promise<void> {
    await this.client.delete(`${this.baseUrl}/channel/${channelId}`);
  }

  // Audit
  async getKeyUsageAudit(keyId: string, startDate: string, endDate: string): Promise<Array<{
    timestamp: string;
    operation: 'encrypt' | 'decrypt';
    userId: string;
    success: boolean;
  }>> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    }).toString();
    return await this.client.get(`${this.baseUrl}/audit/keys/${keyId}?${queryParams}`);
  }

  // Key Backup and Recovery
  async backupKeys(): Promise<{ backupId: string; timestamp: string }> {
    return await this.client.post(`${this.baseUrl}/keys/backup`, {});
  }

  async restoreKeys(backupId: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/keys/restore`, { backupId });
  }

  // Health Check
  async verifyEncryptionSystem(): Promise<{
    status: 'healthy' | 'degraded' | 'failed';
    issues: string[];
  }> {
    return await this.client.get(`${this.baseUrl}/health`);
  }
}
