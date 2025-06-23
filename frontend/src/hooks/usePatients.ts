import { useState, useEffect, useCallback } from 'react';
import { ClinicService } from '../services/ClinicService';
import type { Patient } from '../types/patient';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const clinicService = ClinicService.getInstance();

  const fetchPatients = useCallback(async () => {
    try {
      const fetchedPatients = await clinicService.getAllPatients();
      setPatients(fetchedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, [clinicService]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = useCallback(async (patient: Omit<Patient, 'id'>) => {
    try {
      const newPatient = await clinicService.addPatient(patient);
      setPatients(prev => [...prev, newPatient]);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  }, [clinicService]);

  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>) => {
    try {
      const updatedPatient = await clinicService.updatePatient(id, updates);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  }, [clinicService]);

  const deletePatient = useCallback(async (id: string) => {
    try {
      await clinicService.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  }, [clinicService]);

  const scheduleAppointment = useCallback((patientId: string) => {
    // TODO: Implement appointment scheduling
    console.log('Schedule appointment for patient:', patientId);
  }, []);

  const viewMedicalRecord = useCallback((patientId: string) => {
    // TODO: Implement medical record viewing
    console.log('View medical record for patient:', patientId);
  }, []);

  const sendMessage = useCallback((patientId: string) => {
    // TODO: Implement messaging
    console.log('Send message to patient:', patientId);
  }, []);

  return {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    scheduleAppointment,
    viewMedicalRecord,
    sendMessage,
  };
};
