import axios from 'axios';

type AxiosRequestConfig = any;
type AxiosInstance = any;
type InternalAxiosRequestConfig = any;
type AxiosError = any;
import authService from './auth';

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response types
interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      const token = authService.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        // Add request ID for tracing
        config.headers['X-Request-ID'] = crypto.randomUUID();
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      
      // Handle token expiration
      if (error.response?.status === 401 && !originalRequest?.headers['X-Retry-Auth']) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Transform error to our ApiError format
      const apiError = new ApiError(
        error.response?.data?.message || 'An unexpected error occurred',
        error.response?.status || 500,
        error.response?.data?.code || 'UNKNOWN_ERROR',
        error.response?.data?.details
      );
      
      return Promise.reject(apiError);
    }
  );

  return client;
};

// API client instance
const apiClient = createApiClient();

// Generic request wrapper with retries
const makeRequest = async <T>(
  config: AxiosRequestConfig,
  retries = 3
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    const axiosError = error as any;
    if (retries > 0 && axiosError.response?.status >= 500) {
      // Exponential backoff
      const delay = Math.pow(2, 4 - retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeRequest<T>(config, retries - 1);
    }
    throw error;
  }
};

// API endpoints
export const axiosInstance = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.headers['X-Retry-Auth']) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => makeRequest<T>({ method: 'get', url, ...config }),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => makeRequest<T>({ method: 'post', url, data, ...config }),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => makeRequest<T>({ method: 'put', url, data, ...config }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => makeRequest<T>({ method: 'delete', url, ...config }),
  // Health Records
  healthRecords: {
    getAll: () => 
      makeRequest<any[]>({ method: 'GET', url: '/health-records' }),
    
    getById: (id: string) =>
      makeRequest<any>({ method: 'GET', url: `/health-records/${id}` }),
    
    create: (data: any) =>
      makeRequest<any>({ method: 'POST', url: '/health-records', data }),
    
    update: (id: string, data: any) =>
      makeRequest<any>({ method: 'PUT', url: `/health-records/${id}`, data }),
    
    delete: (id: string) =>
      makeRequest<void>({ method: 'DELETE', url: `/health-records/${id}` }),
  },

  // Consent Management
  consent: {
    getAll: () => 
      makeRequest<any[]>({ method: 'GET', url: '/consents' }),
    
    grant: (data: any) =>
      makeRequest<any>({ method: 'POST', url: '/consents', data }),
    
    revoke: (id: string) =>
      makeRequest<void>({ method: 'DELETE', url: `/consents/${id}` }),
    
    update: (id: string, data: any) =>
      makeRequest<any>({ method: 'PUT', url: `/consents/${id}`, data }),
  },

  // User Management
  users: {
    getCurrent: () => 
      makeRequest<any>({ method: 'GET', url: '/users/me' }),
    
    update: (data: any) =>
      makeRequest<any>({ method: 'PUT', url: '/users/me', data }),
    
    updatePassword: (data: any) =>
      makeRequest<void>({ method: 'PUT', url: '/users/me/password', data }),
  },

  // AI Insights
  insights: {
    generate: (data: any) =>
      makeRequest<any>({ 
        method: 'POST', 
        url: '/ai/insights', 
        data,
        timeout: 30000, // Longer timeout for AI processing
      }),
    
    getHistory: () =>
      makeRequest<any[]>({ method: 'GET', url: '/ai/insights/history' }),
  },
};

// Error handling utilities
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
