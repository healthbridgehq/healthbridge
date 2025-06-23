import React from 'react';
import { ClinicAppointments } from '../components/clinic';
import { useClinicAppointments } from '../hooks/useClinicAppointments';

const ClinicAppointmentsContainer: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    confirmAppointment,
    rescheduleAppointment,
  } = useClinicAppointments();

  return (
    <ClinicAppointments
      appointments={appointments}
      onAddAppointment={addAppointment}
      onUpdateAppointment={updateAppointment}
      onDeleteAppointment={deleteAppointment}
      onConfirmAppointment={confirmAppointment}
      onRescheduleAppointment={rescheduleAppointment}
    />
  );
};

export default ClinicAppointmentsContainer;
