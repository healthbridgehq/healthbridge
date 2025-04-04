import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  PatientDashboard,
  PatientAppointments,
  PatientBilling,
  HealthSummary,
  HealthTimeline,
  ConsentManager,
  PatientIdentityForm,
} from '../components/patient';
import {
  ClinicDashboard,
  ClinicAppointments,
  ClinicBilling,
  StaffManagement,
  PatientManagement,
} from '../components/clinic';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Patient Portal Routes */}
      {user?.role === 'patient' && (
        <>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/patient/billing" element={<PatientBilling />} />
          <Route path="/patient/health-summary" element={<HealthSummary />} />
          <Route path="/patient/health-timeline" element={<HealthTimeline />} />
          <Route path="/patient/consents" element={<ConsentManager />} />
          <Route path="/patient/identity" element={<PatientIdentityForm />} />
          <Route path="/" element={<Navigate to="/patient" replace />} />
        </>
      )}

      {/* Clinic Portal Routes */}
      {user?.role === 'clinic' && (
        <>
          <Route path="/clinic" element={<ClinicDashboard />} />
          <Route path="/clinic/appointments" element={<ClinicAppointments />} />
          <Route path="/clinic/billing" element={<ClinicBilling />} />
          <Route path="/clinic/staff" element={<StaffManagement />} />
          <Route path="/clinic/patients" element={<PatientManagement />} />
          <Route path="/" element={<Navigate to="/clinic" replace />} />
        </>
      )}

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
