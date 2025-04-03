import { APIClient } from '../apiClient';

export interface SecureMessage {
  id?: string;
  senderId: string;
  recipientId: string;
  recipientType: 'HPI-I' | 'HPI-O';
  subject: string;
  content: string;
  priority: 'normal' | 'urgent';
  category: 'clinical' | 'administrative' | 'pathology' | 'imaging' | 'prescription';
  attachments?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    hash: string;
  }>;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'error';
  timestamp: string;
  conversationId?: string;
  replyTo?: string;
}

export interface ProviderDirectory {
  hpiNumber: string;
  type: 'HPI-I' | 'HPI-O';
  name: string;
  specialty?: string;
  address: {
    line1: string;
    line2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  contact: {
    phone?: string;
    fax?: string;
    email?: string;
    securemessaging?: string;
  };
}

class SecureMessagingService {
  private static instance: SecureMessagingService;
  private client: APIClient;
  private readonly baseUrl: string = 'https://api.healthbridge-au.com/securemessaging';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): SecureMessagingService {
    if (!SecureMessagingService.instance) {
      SecureMessagingService.instance = new SecureMessagingService();
    }
    return SecureMessagingService.instance;
  }

  // Message Operations
  async sendMessage(message: Omit<SecureMessage, 'id' | 'status' | 'timestamp'>): Promise<SecureMessage> {
    return await this.client.post<SecureMessage>(`${this.baseUrl}/messages`, message);
  }

  async getMessage(messageId: string): Promise<SecureMessage> {
    return await this.client.get<SecureMessage>(`${this.baseUrl}/messages/${messageId}`);
  }

  async getInbox(
    filter?: { 
      status?: SecureMessage['status'],
      category?: SecureMessage['category'],
      from?: string,
      to?: string 
    }
  ): Promise<SecureMessage[]> {
    const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
    return await this.client.get<SecureMessage[]>(`${this.baseUrl}/messages/inbox?${queryParams}`);
  }

  async getSent(
    filter?: {
      status?: SecureMessage['status'],
      category?: SecureMessage['category'],
      from?: string,
      to?: string
    }
  ): Promise<SecureMessage[]> {
    const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
    return await this.client.get<SecureMessage[]>(`${this.baseUrl}/messages/sent?${queryParams}`);
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.client.put(`${this.baseUrl}/messages/${messageId}/read`, {});
  }

  // Provider Directory Operations
  async searchProviders(
    query: string,
    filter?: {
      type?: 'HPI-I' | 'HPI-O',
      specialty?: string,
      state?: string
    }
  ): Promise<ProviderDirectory[]> {
    const queryParams = new URLSearchParams({
      q: query,
      ...filter as Record<string, string>
    }).toString();
    return await this.client.get<ProviderDirectory[]>(`${this.baseUrl}/directory/search?${queryParams}`);
  }

  async getProviderDetails(hpiNumber: string): Promise<ProviderDirectory> {
    return await this.client.get<ProviderDirectory>(`${this.baseUrl}/directory/${hpiNumber}`);
  }

  // Attachment Operations
  async uploadAttachment(
    messageId: string,
    file: File
  ): Promise<{ id: string; filename: string; mimeType: string; size: number; hash: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return await this.client.post(`${this.baseUrl}/messages/${messageId}/attachments`, formData);
  }

  async downloadAttachment(messageId: string, attachmentId: string): Promise<Blob> {
    return await this.client.get<Blob>(
      `${this.baseUrl}/messages/${messageId}/attachments/${attachmentId}`,
      { responseType: 'blob' }
    );
  }

  // Pathology and Diagnostic Imaging
  async sendPathologyResult(
    result: {
      patientId: string,
      providerId: string,
      testType: string,
      results: any,
      interpretation: string,
      attachments?: File[]
    }
  ): Promise<SecureMessage> {
    const message: Omit<SecureMessage, 'id' | 'status' | 'timestamp'> = {
      senderId: result.providerId,
      recipientId: result.patientId,
      recipientType: 'HPI-I',
      subject: `Pathology Results - ${result.testType}`,
      content: JSON.stringify(result),
      priority: 'normal',
      category: 'pathology'
    };
    return await this.sendMessage(message);
  }

  async sendImagingResult(
    result: {
      patientId: string,
      providerId: string,
      modality: string,
      findings: string,
      impression: string,
      attachments?: File[]
    }
  ): Promise<SecureMessage> {
    const message: Omit<SecureMessage, 'id' | 'status' | 'timestamp'> = {
      senderId: result.providerId,
      recipientId: result.patientId,
      recipientType: 'HPI-I',
      subject: `Imaging Results - ${result.modality}`,
      content: JSON.stringify(result),
      priority: 'normal',
      category: 'imaging'
    };
    return await this.sendMessage(message);
  }
}
