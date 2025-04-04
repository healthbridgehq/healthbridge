import { useQuery, useMutation, useQueryClient } from 'react-query';
import { StaffService } from '../services/StaffService';
import { Staff } from '../types/clinic';

export const useClinicStaff = () => {
  const queryClient = useQueryClient();
  const staffService = new StaffService();

  const {
    data: staff,
    isLoading,
    error,
  } = useQuery('clinic-staff', () => staffService.getAllStaff());

  const addStaffMutation = useMutation(
    (newStaff: Omit<Staff, 'id'>) => staffService.addStaff(newStaff),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-staff');
      },
    }
  );

  const updateStaffMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<Staff> }) =>
      staffService.updateStaff(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-staff');
      },
    }
  );

  const deleteStaffMutation = useMutation(
    (id: string) => staffService.deleteStaff(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-staff');
      },
    }
  );

  const verifyStaffMutation = useMutation(
    (id: string) => staffService.verifyStaff(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clinic-staff');
      },
    }
  );

  return {
    staff,
    isLoading,
    error,
    addStaff: addStaffMutation.mutate,
    updateStaff: updateStaffMutation.mutate,
    deleteStaff: deleteStaffMutation.mutate,
    verifyStaff: verifyStaffMutation.mutate,
    isAddingStaff: addStaffMutation.isLoading,
    isUpdatingStaff: updateStaffMutation.isLoading,
    isDeletingStaff: deleteStaffMutation.isLoading,
    isVerifyingStaff: verifyStaffMutation.isLoading,
  };
};
