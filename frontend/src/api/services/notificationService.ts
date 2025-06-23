import { APIClient } from '../client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

class NotificationService {
  private client: APIClient;

  constructor() {
    this.client = APIClient.getInstance();
  }

  async getNotifications(): Promise<Notification[]> {
    return await this.client.get('/notifications');
  }

  async markAsRead(id: string): Promise<void> {
    await this.client.put(`/notifications/${id}/read`);
  }
}

export const notificationService = new NotificationService();
