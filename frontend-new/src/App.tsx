import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/layout/MainLayout';
import Analytics from './pages/Analytics';
import Patients from './pages/Patients';
import HealthRecords from './pages/HealthRecords';
import Settings from './pages/Settings';
import theme from './theme';

const queryClient = new QueryClient();

function App() {
  // For demo purposes, let's assume the user is authenticated
  const isAuthenticated = true;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          {/* Protected Routes */}
          {[
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/analytics', element: <Analytics /> },
            { path: '/patients', element: <Patients /> },
            { path: '/health-records', element: <HealthRecords /> },
            { path: '/settings', element: <Settings /> },
          ].map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                isAuthenticated ? (
                  <MainLayout>
                    {element}
                  </MainLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          ))}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
