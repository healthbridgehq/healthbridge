import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PatientService } from '../services/PatientService';
import { PatientData, HealthRecord } from '../types/patient';

export const usePatientData = () => {
  const queryClient = useQueryClient();
  const patientService = new PatientService();

  const {
    data,
    isLoading,
    error,
  } = useQuery('patient-data', () => patientService.getPatientData());

  const updatePatientDataMutation = useMutation(
    (updates: Partial<PatientData>) => patientService.updatePatientData(updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patient-data');
      },
    }
  );

  const updateHealthRecordMutation = useMutation(
    (record: HealthRecord) => patientService.updateHealthRecord(record),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patient-data');
      },
    }
  );

  const shareHealthRecordMutation = useMutation(
    ({ providerId, recordId }: { providerId: string; recordId: string }) =>
      patientService.shareHealthRecord(providerId, recordId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patient-data');
      },
    }
  );

  return {
    data,
    isLoading,
    error,
    updatePatientData: updatePatientDataMutation.mutate,
    updateHealthRecord: updateHealthRecordMutation.mutate,
    shareHealthRecord: shareHealthRecordMutation.mutate,
    isUpdating: updatePatientDataMutation.isLoading,
    isUpdatingRecord: updateHealthRecordMutation.isLoading,
    isSharing: shareHealthRecordMutation.isLoading,
  };
};
