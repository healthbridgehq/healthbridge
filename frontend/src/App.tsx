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

// Help Pages
import { HelpCentre } from './components/help/HelpCentre';
import { HelpArticle } from './components/help/HelpArticle';
import { HelpCategory } from './components/help/HelpCategory';
import { helpArticles } from './data/helpArticles';

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

                {/* Help Routes */}
                <Route path="/help">
                  <Route element={<PublicLayout />}>
                    <Route index element={<HelpCentre type="public" />} />
                    <Route path="about" element={<HelpCategory category="About HealthBridge" type="public" />} />
                    <Route path="about/:articleId" element={<HelpArticle type="public" />} />
                    <Route path="getting-started" element={<HelpCategory category="Getting Started" type="public" />} />
                    <Route path="getting-started/:articleId" element={<HelpArticle type="public" />} />
                    <Route path="features" element={<HelpCategory category="Features Overview" type="public" />} />
                    <Route path="features/:articleId" element={<HelpArticle type="public" />} />
                    <Route path="privacy" element={<HelpCategory category="Privacy & Security" type="public" />} />
                    <Route path="privacy/:articleId" element={<HelpArticle type="public" />} />
                    <Route path="faqs" element={<HelpCategory category="FAQs" type="public" />} />
                    <Route path="faqs/:articleId" element={<HelpArticle type="public" />} />
                    <Route path="contact" element={<HelpCategory category="Contact Support" type="public" />} />
                    <Route path="contact/:articleId" element={<HelpArticle type="public" />} />
                  </Route>

                  {/* Patient Help Routes */}
                  <Route path="patient" element={<PatientLayout />}>
                    <Route index element={<HelpCentre type="patient" />} />
                    <Route path="getting-started" element={<HelpCategory category="Getting Started" type="patient" />} />
                    <Route path="getting-started/:articleId" element={<HelpArticle type="patient" />} />
                    <Route path="profile" element={<HelpCategory category="Managing Your Profile" type="patient" />} />
                    <Route path="profile/:articleId" element={<HelpArticle type="patient" />} />
                    <Route path="my-health-record" element={<HelpCategory category="My Health Record Integration" type="patient" />} />
                    <Route path="my-health-record/:articleId" element={<HelpArticle type="patient" />} />
                    <Route path="appointments" element={<HelpCategory category="Appointments & Bookings" type="patient" />} />
                    <Route path="appointments/:articleId" element={<HelpArticle type="patient" />} />
                    <Route path="privacy" element={<HelpCategory category="Privacy & Security" type="patient" />} />
                    <Route path="privacy/:articleId" element={<HelpArticle type="patient" />} />
                    <Route path="troubleshooting" element={<HelpCategory category="Troubleshooting" type="patient" />} />
                    <Route path="troubleshooting/:articleId" element={<HelpArticle type="patient" />} />
                  </Route>
                  
                  {/* Clinic Help Routes */}
                  <Route path="clinic" element={<ClinicLayout />}>
                    <Route index element={<HelpCentre type="clinic" />} />
                    <Route path="getting-started" element={<HelpCategory category="Getting Started" type="clinic" />} />
                    <Route path="getting-started/:articleId" element={<HelpArticle type="clinic" />} />
                    <Route path="staff" element={<HelpCategory category="Staff Management" type="clinic" />} />
                    <Route path="staff/:articleId" element={<HelpArticle type="clinic" />} />
                    <Route path="records" element={<HelpCategory category="Patient Records" type="clinic" />} />
                    <Route path="records/:articleId" element={<HelpArticle type="clinic" />} />
                    <Route path="integrations" element={<HelpCategory category="Integrations" type="clinic" />} />
                    <Route path="integrations/:articleId" element={<HelpArticle type="clinic" />} />
                    <Route path="appointments" element={<HelpCategory category="Appointments & Calendar" type="clinic" />} />
                    <Route path="appointments/:articleId" element={<HelpArticle type="clinic" />} />
                    <Route path="billing" element={<HelpCategory category="Billing & Reports" type="clinic" />} />
                    <Route path="billing/:articleId" element={<HelpArticle type="clinic" />} />
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
