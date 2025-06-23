import { useState, useEffect, useCallback } from 'react';
import { ClinicService } from '../services/ClinicService';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  type: string;
  notes?: string;
}

export const useClinicAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const clinicService = ClinicService.getInstance();

  const fetchAppointments = useCallback(async () => {
    try {
      const fetchedAppointments = await clinicService.getAppointments();
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [clinicService]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const addAppointment = useCallback(async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await clinicService.createAppointment(appointment);
      setAppointments(prev => [...prev, newAppointment]);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  }, [clinicService]);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    try {
      const updatedAppointment = await clinicService.updateAppointment(id, updates);
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }, [clinicService]);

  const deleteAppointment = useCallback(async (id: string) => {
    try {
      await clinicService.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }, [clinicService]);

  const confirmAppointment = useCallback(async (id: string) => {
    try {
      await updateAppointment(id, { status: 'confirmed' });
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  }, [updateAppointment]);

  const rescheduleAppointment = useCallback(async (id: string, date: string, time: string) => {
    try {
      await updateAppointment(id, { date, time });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  }, [updateAppointment]);

  return {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    confirmAppointment,
    rescheduleAppointment,
  };
};
