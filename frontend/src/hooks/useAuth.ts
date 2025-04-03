import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/services/authService';
import { UserIdentity, AuthResponse } from '../types/auth';

interface AuthContextType {
  user: UserIdentity | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  registerPatient: (data: any) => Promise<void>;
  registerClinic: (data: any) => Promise<void>;
  registerProvider: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Query for current user
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery<UserIdentity | null>(
    ['currentUser'],
    () => authService.getCurrentUser(),
    {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Login mutation
  const loginMutation = useMutation<
    AuthResponse,
    Error,
    { email: string; password: string; mfaCode?: string }
  >(
    ({ email, password, mfaCode }) => authService.login(email, password, mfaCode),
    {
      onSuccess: () => {
        refetchUser();
        setError(null);
      },
      onError: (error) => {
        setError(error);
      },
    }
  );

  // Logout mutation
  const logoutMutation = useMutation(() => authService.logout(), {
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });

  // Registration mutations
  const patientRegistrationMutation = useMutation(
    (data: any) => authService.registerPatient(data),
    {
      onSuccess: () => {
        refetchUser();
        navigate('/verify-email');
      },
      onError: (error) => {
        setError(error);
      },
    }
  );

  const clinicRegistrationMutation = useMutation(
    (data: any) => authService.registerClinic(data),
    {
      onSuccess: () => {
        refetchUser();
        navigate('/verify-business');
      },
      onError: (error) => {
        setError(error);
      },
    }
  );

  const providerRegistrationMutation = useMutation(
    (data: any) => authService.registerProvider(data),
    {
      onSuccess: () => {
        refetchUser();
        navigate('/verify-credentials');
      },
      onError: (error) => {
        setError(error);
      },
    }
  );

  // Authentication methods
  const login = useCallback(
    async (email: string, password: string, mfaCode?: string) => {
      await loginMutation.mutateAsync({ email, password, mfaCode });
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const registerPatient = useCallback(
    async (data: any) => {
      await patientRegistrationMutation.mutateAsync(data);
    },
    [patientRegistrationMutation]
  );

  const registerClinic = useCallback(
    async (data: any) => {
      await clinicRegistrationMutation.mutateAsync(data);
    },
    [clinicRegistrationMutation]
  );

  const registerProvider = useCallback(
    async (data: any) => {
      await providerRegistrationMutation.mutateAsync(data);
    },
    [providerRegistrationMutation]
  );

  // Token refresh logic
  useEffect(() => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) return;

    const refreshTokens = async () => {
      try {
        await authService.refreshToken(refreshToken);
        refetchUser();
      } catch (error) {
        await logout();
      }
    };

    // Refresh token 1 minute before expiry
    const tokenExpiryTime = 14 * 60 * 1000; // 14 minutes (assuming 15-minute tokens)
    const refreshInterval = setInterval(refreshTokens, tokenExpiryTime);

    return () => clearInterval(refreshInterval);
  }, [logout, refetchUser]);

  const value = {
    user,
    isLoading:
      isLoading ||
      loginMutation.isLoading ||
      logoutMutation.isLoading ||
      patientRegistrationMutation.isLoading ||
      clinicRegistrationMutation.isLoading ||
      providerRegistrationMutation.isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    registerPatient,
    registerClinic,
    registerProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
