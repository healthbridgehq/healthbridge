import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services/authService';
import type {
  UserIdentity,
  AuthResponse,
  PatientRegistration,
  ClinicRegistration,
  ProviderRegistration,
  VerificationRequest,
  VerificationResponse,
  ResetPasswordData
} from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserIdentity | null;
  login: (email: string, password: string, mfaCode?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  registerPatient: (data: PatientRegistration) => Promise<AuthResponse>;
  registerClinic: (data: ClinicRegistration) => Promise<AuthResponse>;
  registerProvider: (data: ProviderRegistration) => Promise<AuthResponse>;
  requestVerification: (request: VerificationRequest) => Promise<VerificationResponse>;
  submitVerification: (request: VerificationRequest) => Promise<VerificationResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  isLogoutLoading: boolean;
  isRegistrationLoading: boolean;
  isVerificationLoading: boolean;
  isResetLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Query for current user
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation<
    AuthResponse,
    Error,
    { email: string; password: string; mfaCode?: string }
  >({
    mutationFn: async ({ email, password, mfaCode }) => {
      const response = await authService.login(email, password, mfaCode || '');
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      }
      return response;
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await authService.logout();
      queryClient.clear();
      navigate('/login');
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
    },
  });

  // Registration mutation
  const patientRegistrationMutation = useMutation<AuthResponse, Error, PatientRegistration>({
    mutationFn: async (data) => {
      const response = await authService.registerPatient(data);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      }
      return response;
    },
    onError: (error: Error) => {
      console.error('Patient registration failed:', error);
    },
  });

  const clinicRegistrationMutation = useMutation<AuthResponse, Error, ClinicRegistration>({
    mutationFn: async (data) => {
      const response = await authService.registerClinic(data);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      }
      return response;
    },
    onError: (error: Error) => {
      console.error('Clinic registration failed:', error);
    },
  });

  const providerRegistrationMutation = useMutation<AuthResponse, Error, ProviderRegistration>({
    mutationFn: async (data) => {
      const response = await authService.registerProvider(data);
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      }
      return response;
    },
    onError: (error: Error) => {
      console.error('Provider registration failed:', error);
    },
  });

  // Verify email mutation
  const verificationMutation = useMutation<VerificationResponse, Error, VerificationRequest>({
    mutationFn: async (request) => {
      return await authService.submitVerification(request);
    },
    onError: (error: Error) => {
      console.error('Verification failed:', error);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation<void, Error, ResetPasswordData>({
    mutationFn: async (data) => {
      await authService.resetPassword(data.token, data.newPassword);
    },
    onError: (error: Error) => {
      console.error('Password reset failed:', error);
    },
  });

  // Token refresh logic
  useEffect(() => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) return;

    const refreshTokens = async () => {
      try {
        await authService.refreshToken(refreshToken);
      } catch (error) {
        await logoutMutation.mutateAsync();
      }
    };

    // Refresh token 1 minute before expiry
    const tokenExpiryTime = 14 * 60 * 1000; // 14 minutes (assuming 15-minute tokens)
    const refreshInterval = setInterval(refreshTokens, tokenExpiryTime);

    return () => clearInterval(refreshInterval);
  }, [logoutMutation]);

  const value: AuthContextType = {
    isAuthenticated,
    user: userData || user,
    login: (email, password, mfaCode) =>
      loginMutation.mutateAsync({ email, password, mfaCode }),
    logout: logoutMutation.mutateAsync,
    registerPatient: patientRegistrationMutation.mutateAsync,
    registerClinic: clinicRegistrationMutation.mutateAsync,
    registerProvider: providerRegistrationMutation.mutateAsync,
    requestVerification: authService.requestVerification.bind(authService),
    submitVerification: verificationMutation.mutateAsync,
    resetPassword: (token, newPassword) =>
      resetPasswordMutation.mutateAsync({ token, newPassword, email: '' }),
    isLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isRegistrationLoading:
      patientRegistrationMutation.isPending ||
      clinicRegistrationMutation.isPending ||
      providerRegistrationMutation.isPending,
    isVerificationLoading: verificationMutation.isPending,
    isResetLoading: resetPasswordMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
