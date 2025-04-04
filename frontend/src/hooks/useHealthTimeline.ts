import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { healthService } from '../api/services/healthService';
import { HealthEvent } from '../types/health';

interface UseHealthTimelineOptions {
  startDate?: string;
  endDate?: string;
  types?: string[];
  limit?: number;
  useInfinite?: boolean;
}

export const useHealthTimeline = (
  patientId: string,
  options: UseHealthTimelineOptions = {}
) => {
  const { startDate, endDate, types, limit = 20, useInfinite = false } = options;

  const queryKey = ['healthTimeline', patientId, startDate, endDate, types];

  if (useInfinite) {
    return useInfiniteQuery<{ events: HealthEvent[]; nextCursor?: string }>(
      queryKey,
      async ({ pageParam = undefined }) => {
        const events = await healthService.getHealthTimeline(patientId, {
          startDate,
          endDate,
          types,
          limit,
          offset: pageParam,
        });
        
        const lastEvent = events[events.length - 1];
        const nextCursor = events.length === limit ? lastEvent.id : undefined;
        
        return {
          events,
          nextCursor,
        };
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
      }
    );
  }

  return useQuery<HealthEvent[]>(
    queryKey,
    () =>
      healthService.getHealthTimeline(patientId, {
        startDate,
        endDate,
        types,
        limit,
      }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: true,
    }
  );
};
