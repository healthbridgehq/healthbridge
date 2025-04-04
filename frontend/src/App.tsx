import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import { ClinicLayout, PatientLayout, PublicLayout } from './components/Layout';

// Public Pages
import { About, Contact, Features } from './pages/public';

// Patient Pages
import {
  Login,
  Register,
  ForgotPassword,
  Dashboard,
  HealthRecords,
  AIAssistant,
  Appointments
} from './pages/patient';

// Clinic Pages
import {
  Login as ClinicLogin,
  Dashboard as ClinicDashboard,
  AppointmentManagement,
  Analytics,
  Billing
} from './pages/clinic';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute = ({ children, userType }: { children: React.ReactNode; userType?: 'patient' | 'clinic' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={`/${userType}/login`} />;
  }

  if (userType && user?.role !== userType) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3}>
            <CssBaseline />
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<About />} />
                  <Route path="about" element={<About />} />
                  <Route path="features" element={<Features />} />
                  <Route path="contact" element={<Contact />} />
                </Route>
                
                {/* Patient Routes */}
                <Route path="/patient">
                  {/* Public Patient Routes */}
                  <Route path="login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  <Route path="forgot-password" element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } />
                  
                  {/* Protected Patient Routes */}
                  <Route element={<PatientLayout />}>
                    <Route path="dashboard" element={
                      <ProtectedRoute userType="patient">
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="health-records" element={
                      <ProtectedRoute userType="patient">
                        <HealthRecords />
                      </ProtectedRoute>
                    } />
                    <Route path="ai-assistant" element={
                      <ProtectedRoute userType="patient">
                        <AIAssistant />
                      </ProtectedRoute>
                    } />
                    <Route path="appointments" element={
                      <ProtectedRoute userType="patient">
                        <Appointments />
                      </ProtectedRoute>
                    } />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Route>
                </Route>

                {/* Clinic Routes */}
                <Route path="/clinic">
                  {/* Public Clinic Routes */}
                  <Route path="login" element={
                    <PublicRoute>
                      <ClinicLogin />
                    </PublicRoute>
                  } />
                  
                  {/* Protected Clinic Routes */}
                  <Route element={<ClinicLayout />}>
                    <Route path="dashboard" element={
                      <ProtectedRoute userType="clinic">
                        <ClinicDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="appointments" element={
                      <ProtectedRoute userType="clinic">
                        <AppointmentManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="analytics" element={
                      <ProtectedRoute userType="clinic">
                        <Analytics />
                      </ProtectedRoute>
                    } />
                    <Route path="billing" element={
                      <ProtectedRoute userType="clinic">
                        <Billing />
                      </ProtectedRoute>
                    } />
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Route>
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
