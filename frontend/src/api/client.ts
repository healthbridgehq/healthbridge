import axios from 'axios';
import { ApiResponse } from './types';

type AxiosStatic = typeof axios;
type AxiosRequestConfig = {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  baseURL?: string;
  headers?: Record<string, string>;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
};

interface AxiosError extends Error {
  config?: AxiosRequestConfig;
  response?: {
    status: number;
    data: any;
  };
  isAxiosError: boolean;
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export class APIClient {
  private client: AxiosStatic;
  private static instance: APIClient;

  constructor() {
    this.client = axios;
    this.client.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    this.client.defaults.timeout = 30000;
    this.client.defaults.headers.common['Content-Type'] = 'application/json';

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (!config.headers) {
          config.headers = {};
        }
        config.headers['Authorization'] = `Bearer ${token}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const { access_token } = await this.refreshAuth(refreshToken);
              localStorage.setItem('auth_token', access_token);
              if (error.config?.url) {
                return this.client.request({
                  ...error.config,
                  url: error.config.url,
                  headers: {
                    ...error.config.headers,
                    Authorization: `Bearer ${access_token}`
                  }
                });
              }
            } catch (refreshError) {
              this.handleAuthError();
            }
          } else {
            this.handleAuthError();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  public static createInstance(): APIClient {
    return new APIClient();
  }

  private async refreshAuth(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const response = await this.client.post<ApiResponse<{ access_token: string }>>('/auth/refresh', { refresh_token: refreshToken });
      return response.data.data;
    } catch (error) {
      console.error('Error refreshing auth token:', error);
      throw error;
    }
  }

  private handleAuthError(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }
}
