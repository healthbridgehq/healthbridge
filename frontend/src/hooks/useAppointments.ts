import { useQuery, useMutation, useQueryClient, UseQueryResult } from 'react-query';
import { AppointmentService } from '../services';
import { Appointment } from '../types/patient';
import axios from 'axios';

interface AxiosError<T = any> extends Error {
  config: any;
  code?: string;
  request?: any;
  response?: {
    data: T;
    status: number;
    headers: any;
  };
  isAxiosError: boolean;
}

interface DoctorAvailability {
  timeSlots: Array<{
    time: string;
    available: boolean;
  }>;
}

export const useAppointments = () => {
  const queryClient = useQueryClient();
  const appointmentService = new AppointmentService();

  const {
    data: appointments,
    isLoading,
    error,
  } = useQuery('appointments', () => appointmentService.getAllAppointments());

  const addAppointmentMutation = useMutation<
    Appointment,
    AxiosError,
    Omit<Appointment, 'id'>
  >(
    (newAppointment) => appointmentService.createAppointment(newAppointment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        queryClient.invalidateQueries('doctor-availability');
      },
      onError: (error) => {
        console.error('Failed to create appointment:', error.message);
      },
    }
  );

  const updateAppointmentMutation = useMutation<
    Appointment,
    AxiosError,
    { id: string; updates: Partial<Appointment> }
  >(
    ({ id, updates }) => appointmentService.updateAppointment(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        queryClient.invalidateQueries('doctor-availability');
      },
      onError: (error) => {
        console.error('Failed to update appointment:', error.message);
      },
    }
  );

  const cancelAppointmentMutation = useMutation<
    void,
    AxiosError,
    string
  >(
    (id) => appointmentService.cancelAppointment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        queryClient.invalidateQueries('doctor-availability');
      },
      onError: (error) => {
        console.error('Failed to cancel appointment:', error.message);
      },
    }
  );

  const checkInMutation = useMutation<
    void,
    AxiosError,
    string
  >(
    (id) => appointmentService.checkInPatient(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
      onError: (error) => {
        console.error('Failed to check in patient:', error.message);
      },
    }
  );

  const getDoctorAvailabilityQuery = (doctorId: string, date: string): UseQueryResult<DoctorAvailability, AxiosError> =>
    useQuery(
      ['doctor-availability', doctorId, date],
      () => appointmentService.getDoctorAvailability(doctorId, date),
      {
        enabled: Boolean(doctorId && date),
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );

  return {
    appointments,
    isLoading,
    error,
    addAppointment: addAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    checkInPatient: checkInMutation.mutate,
    getDoctorAvailability: getDoctorAvailabilityQuery,
    isAddingAppointment: addAppointmentMutation.isLoading,
    isUpdatingAppointment: updateAppointmentMutation.isLoading,
    isCancellingAppointment: cancelAppointmentMutation.isLoading,
    isCheckingIn: checkInMutation.isLoading,
  };
};
