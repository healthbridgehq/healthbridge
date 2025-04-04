import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '../api/services/healthService';
import { HealthSummary } from '../types/health';

export const useHealthSummary = (patientId: string) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<HealthSummary>(
    ['healthSummary', patientId],
    () => healthService.getHealthSummary(patientId),
    {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
      refetchOnWindowFocus: true,
      retry: 2,
    }
  );

  const invalidateHealthData = () => {
    queryClient.invalidateQueries(['healthSummary', patientId]);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidateHealthData,
  };
};
