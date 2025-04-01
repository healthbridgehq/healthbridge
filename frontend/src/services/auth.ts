import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
  is_patient: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    is_patient: boolean;
  };
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem('token');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
    this.token = token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeader(): { Authorization: string } | {} {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export default AuthService.getInstance();
