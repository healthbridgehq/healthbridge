import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentService } from '../api/services/consentService';
import {
  ConsentSetting,
  ConsentHistory,
  ConsentRequest,
  DataCategory,
  AccessLevel,
} from '../types/consent';

export const useConsents = (patientId: string) => {
  const queryClient = useQueryClient();
  const consentQueryKey = ['consents', patientId];

  // Fetch current consent settings
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<ConsentSetting[]>(
    consentQueryKey,
    () => consentService.getConsentSettings(patientId),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  // Update consent mutation
  const updateMutation = useMutation(
    ({
      consentId,
      updates,
    }: {
      consentId: string;
      updates: Partial<ConsentSetting>;
    }) => consentService.updateConsentSetting(patientId, consentId, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(consentQueryKey);
      },
    }
  );

  // Create consent mutation
  const createMutation = useMutation(
    (consent: Omit<ConsentSetting, 'id' | 'lastUpdated' | 'updatedBy'>) =>
      consentService.createConsentSetting(patientId, consent),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(consentQueryKey);
      },
    }
  );

  // Revoke consent mutation
  const revokeMutation = useMutation(
    ({ consentId, reason }: { consentId: string; reason?: string }) =>
      consentService.revokeConsent(patientId, consentId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(consentQueryKey);
      },
    }
  );

  // Fetch consent history
  const useConsentHistory = (options?: {
    startDate?: string;
    endDate?: string;
    clinicId?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery<ConsentHistory[]>(
      ['consentHistory', patientId, options],
      () => consentService.getConsentHistory(patientId, options),
      {
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
      }
    );
  };

  // Fetch consent requests
  const useConsentRequests = (options?: {
    status?: 'pending' | 'approved' | 'denied' | 'expired';
    clinicId?: string;
    limit?: number;
    offset?: number;
  }) => {
    return useQuery<ConsentRequest[]>(
      ['consentRequests', patientId, options],
      () => consentService.getConsentRequests(patientId, options),
      {
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
      }
    );
  };

  // Respond to consent request mutation
  const respondToRequestMutation = useMutation(
    ({
      requestId,
      response,
    }: {
      requestId: string;
      response: {
        approved: boolean;
        accessLevel?: AccessLevel;
        dataCategories?: DataCategory[];
        duration?: number;
        notes?: string;
      };
    }) => consentService.respondToConsentRequest(patientId, requestId, response),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['consentRequests', patientId]);
      },
    }
  );

  // Validate consent
  const validateConsentMutation = useMutation(
    ({
      clinicId,
      request,
    }: {
      clinicId: string;
      request: {
        dataCategory: DataCategory;
        accessType: 'view' | 'download' | 'share';
        resourceId?: string;
      };
    }) => consentService.validateConsent(patientId, clinicId, request)
  );

  const updateConsent = (consentId: string, updates: Partial<ConsentSetting>) => {
    return updateMutation.mutate({ consentId, updates });
  };

  const createConsent = (
    consent: Omit<ConsentSetting, 'id' | 'lastUpdated' | 'updatedBy'>
  ) => {
    return createMutation.mutate(consent);
  };

  const revokeConsent = (consentId: string, reason?: string) => {
    return revokeMutation.mutate({ consentId, reason });
  };

  const respondToRequest = (
    requestId: string,
    response: {
      approved: boolean;
      accessLevel?: AccessLevel;
      dataCategories?: DataCategory[];
      duration?: number;
      notes?: string;
    }
  ) => {
    return respondToRequestMutation.mutate({ requestId, response });
  };

  const validateConsent = (
    clinicId: string,
    request: {
      dataCategory: DataCategory;
      accessType: 'view' | 'download' | 'share';
      resourceId?: string;
    }
  ) => {
    return validateConsentMutation.mutate({ clinicId, request });
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    updateConsent,
    isUpdating: updateMutation.isLoading,
    updateError: updateMutation.error,
    createConsent,
    isCreating: createMutation.isLoading,
    createError: createMutation.error,
    revokeConsent,
    isRevoking: revokeMutation.isLoading,
    revokeError: revokeMutation.error,
    useConsentHistory,
    useConsentRequests,
    respondToRequest,
    isResponding: respondToRequestMutation.isLoading,
    respondError: respondToRequestMutation.error,
    validateConsent,
    isValidating: validateConsentMutation.isLoading,
    validateError: validateConsentMutation.error,
  };
};
