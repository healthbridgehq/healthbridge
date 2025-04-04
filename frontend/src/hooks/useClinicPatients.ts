import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ClinicService } from '../services/ClinicService';
import { Patient } from '../types/clinic';

export const useClinicPatients = () => {
  const queryClient = useQueryClient();
  const clinicService = new ClinicService();

  const {
    data: patients,
    isLoading,
    error,
  } = useQuery('clinic-patients', () => clinicService.getAllPatients());

  const addPatientMutation = useMutation(
    (newPatient: Omit<Patient, 'id'>) => clinicService.addPatient(newPatient),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-patients');
      },
    }
  );

  const updatePatientMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<Patient> }) =>
      clinicService.updatePatient(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-patients');
      },
    }
  );

  const deletePatientMutation = useMutation(
    (id: string) => clinicService.deletePatient(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-patients');
      },
    }
  );

  const verifyPatientMutation = useMutation(
    (id: string) => clinicService.verifyPatient(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-patients');
      },
    }
  );

  return {
    patients,
    isLoading,
    error,
    addPatient: addPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    deletePatient: deletePatientMutation.mutate,
    verifyPatient: verifyPatientMutation.mutate,
    isAddingPatient: addPatientMutation.isLoading,
    isUpdatingPatient: updatePatientMutation.isLoading,
    isDeletingPatient: deletePatientMutation.isLoading,
    isVerifyingPatient: verifyPatientMutation.isLoading,
  };
};
