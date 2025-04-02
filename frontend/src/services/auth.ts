import axios from 'axios';

// Using relative URLs with proxy configuration

export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = 'user' | 'practitioner' | 'admin';

export interface RegisterData extends LoginCredentials {
  full_name: string;
  role?: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
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
    const response = await axios.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    this.setToken(response.data.access_token);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>('/auth/register', data);
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
