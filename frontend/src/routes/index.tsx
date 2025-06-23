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
import { HelpCentre } from '../components/help/HelpCentre';
import ClinicDashboardContainer from '../containers/ClinicDashboardContainer';
import ClinicAppointmentsContainer from '../containers/ClinicAppointmentsContainer';
import ClinicBillingContainer from '../containers/ClinicBillingContainer';
import PatientManagementContainer from '../containers/PatientManagementContainer';
import StaffManagementContainer from '../containers/StaffManagementContainer';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        {/* Public Help Center Route */}
        <Route path="/help/*" element={<HelpCentre type="public" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
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
          <Route path="/patient/identity" element={<PatientIdentityForm onSubmit={() => {}} onCancel={() => {}} />} />
          <Route path="/" element={<Navigate to="/patient" replace />} />
        </>
      )}

      {/* Clinic Portal Routes */}
      {user?.role === 'clinic_staff' && (
        <>
          <Route path="/clinic" element={<ClinicDashboardContainer />} />
          <Route path="/clinic/appointments" element={<ClinicAppointmentsContainer />} />
          <Route path="/clinic/billing" element={<ClinicBillingContainer />} />
          <Route path="/clinic/staff" element={<StaffManagementContainer />} />
          <Route path="/clinic/patients" element={<PatientManagementContainer />} />
          <Route path="/" element={<Navigate to="/clinic" replace />} />
        </>
      )}

      {/* Help Center Route - accessible to authenticated users with role-specific content */}
      <Route path="/help/*" element={<HelpCentre type={user?.role === 'clinic_staff' ? 'clinic' : 'patient'} />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
