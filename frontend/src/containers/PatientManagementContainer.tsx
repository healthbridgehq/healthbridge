import React from 'react';
import { PatientManagement } from '../components/clinic';
import { useClinicStaff } from '../hooks/useClinicStaff';
import { usePatients } from '../hooks/usePatients';

const PatientManagementContainer: React.FC = () => {
  const { doctors } = useClinicStaff();
  const {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    scheduleAppointment,
    viewMedicalRecord,
    sendMessage,
  } = usePatients();

  return (
    <PatientManagement
      patients={patients}
      doctors={doctors}
      onAddPatient={addPatient}
      onUpdatePatient={updatePatient}
      onDeletePatient={deletePatient}
      onScheduleAppointment={scheduleAppointment}
      onViewMedicalRecord={viewMedicalRecord}
      onSendMessage={sendMessage}
    />
  );
};

export default PatientManagementContainer;
