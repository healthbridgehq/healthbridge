import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService } from '../api/services/healthService';
import { HealthDocument } from '../types/health';

interface UseDocumentsOptions {
  category?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const useDocuments = (
  patientId: string,
  options: UseDocumentsOptions = {}
) => {
  const queryClient = useQueryClient();
  const queryKey = ['documents', patientId, options];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<HealthDocument[]>(
    queryKey,
    () => healthService.getDocuments(patientId, options),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: true,
    }
  );

  const downloadMutation = useMutation(
    (documentId: string) =>
      healthService.downloadDocument(patientId, documentId),
    {
      onSuccess: (blob, documentId) => {
        // Create and trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${documentId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
    }
  );

  const shareMutation = useMutation(
    ({
      documentId,
      shareData,
    }: {
      documentId: string;
      shareData: {
        recipientId: string;
        accessDuration: number;
        note?: string;
      };
    }) => healthService.shareDocument(patientId, documentId, shareData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
    }
  );

  const downloadDocument = (documentId: string) => {
    return downloadMutation.mutate(documentId);
  };

  const shareDocument = (
    documentId: string,
    shareData: {
      recipientId: string;
      accessDuration: number;
      note?: string;
    }
  ) => {
    return shareMutation.mutate({ documentId, shareData });
  };

  return {
    documents: data,
    isLoading,
    error,
    refetch,
    downloadDocument,
    isDownloading: downloadMutation.isLoading,
    downloadError: downloadMutation.error,
    shareDocument,
    isSharing: shareMutation.isLoading,
    shareError: shareMutation.error,
  };
};
