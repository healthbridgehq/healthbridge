import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClinicDashboard } from '../components/clinic';
import { useClinicStats } from '../hooks/useClinicStats';

const ClinicDashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useClinicStats();

  const handleViewAppointments = () => navigate('/clinic/appointments');
  const handleViewMessages = () => navigate('/clinic/messages');
  const handleViewBilling = () => navigate('/clinic/billing');
  const handleViewPatients = () => navigate('/clinic/patients');

  return (
    <ClinicDashboard
      stats={stats}
      onViewAppointments={handleViewAppointments}
      onViewMessages={handleViewMessages}
      onViewBilling={handleViewBilling}
      onViewPatients={handleViewPatients}
    />
  );
};

export default ClinicDashboardContainer;
