import axios, { AxiosInstance } from 'axios';

export class APIClient {
  private static instance: APIClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  async get<T>(url: string): Promise<T> {
    const { data } = await this.client.get<T>(url);
    return data;
  }

  async post<T>(url: string, body: any, config = {}): Promise<T> {
    const { data } = await this.client.post<T>(url, body, config);
    return data;
  }

  async put<T>(url: string, body: any): Promise<T> {
    const { data } = await this.client.put<T>(url, body);
    return data;
  }

  async delete<T>(url: string): Promise<T> {
    const { data } = await this.client.delete<T>(url);
    return data;
  }
}
