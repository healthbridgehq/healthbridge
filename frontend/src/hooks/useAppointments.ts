import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AppointmentService } from '../services/AppointmentService';
import { Appointment } from '../types/clinic';

export const useAppointments = () => {
  const queryClient = useQueryClient();
  const appointmentService = new AppointmentService();

  const {
    data: appointments,
    isLoading,
    error,
  } = useQuery('appointments', () => appointmentService.getAllAppointments());

  const addAppointmentMutation = useMutation(
    (newAppointment: Omit<Appointment, 'id'>) =>
      appointmentService.createAppointment(newAppointment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  const updateAppointmentMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      appointmentService.updateAppointment(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  const cancelAppointmentMutation = useMutation(
    (id: string) => appointmentService.cancelAppointment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  const checkInMutation = useMutation(
    (id: string) => appointmentService.checkInPatient(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  const getDoctorAvailabilityQuery = (doctorId: string, date: string) =>
    useQuery(['doctor-availability', doctorId, date], () =>
      appointmentService.getDoctorAvailability(doctorId, date)
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
