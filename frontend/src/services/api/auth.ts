import { APIClient } from './client';

export interface AuthResponse {
  token: string;
  user: {
    firstName: string;
    lastName: string;
    id: string;
    email: string;
    role: 'patient' | 'clinic';
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicare: string;
}

const client = APIClient.getInstance();

export const loginPatient = async (data: LoginRequest): Promise<AuthResponse> => {
  return await client.post<AuthResponse>('/auth/patient/login', data);
};

export const registerPatient = async (data: RegisterRequest): Promise<AuthResponse> => {
  return await client.post<AuthResponse>('/auth/patient/register', data);
};

export const loginClinic = async (data: LoginRequest): Promise<AuthResponse> => {
  return await client.post<AuthResponse>('/auth/clinic/login', data);
};

export const logout = async (): Promise<void> => {
  return await client.post('/auth/logout', {});
};
