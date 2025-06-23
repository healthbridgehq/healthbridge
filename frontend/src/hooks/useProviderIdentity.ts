import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProviderIdentityService } from '../services/providerIdentity';

const providerIdentityService = new ProviderIdentityService();

export const useProviderIdentity = () => {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error,
  } = useQuery(['providerProfile'], () => providerIdentityService.getProfile());

  const { mutateAsync: createProfile } = useMutation(
    (data: any) => providerIdentityService.createProfile(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['providerProfile']);
      },
    }
  );

  const { mutateAsync: updateProfile } = useMutation(
    (data: { id: string; updates: any }) =>
      providerIdentityService.updateProfile(data.id, data.updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['providerProfile']);
      },
    }
  );

  const { mutateAsync: verifyAHPRA } = useMutation(
    (ahpraNumber: string) => providerIdentityService.verifyAHPRA(ahpraNumber)
  );

  const { mutateAsync: verifyProviderNumber } = useMutation(
    (providerNumber: string) =>
      providerIdentityService.verifyProviderNumber(providerNumber)
  );

  const { mutateAsync: verifyQualification } = useMutation(
    (data: { degree: string; institution: string }) =>
      providerIdentityService.verifyQualification(data)
  );

  const { mutateAsync: verifyInsurance } = useMutation(
    (data: { provider: string; policyNumber: string }) =>
      providerIdentityService.verifyInsurance(data)
  );

  const { mutateAsync: updatePrivacySettings } = useMutation(
    (data: { id: string; settings: any }) =>
      providerIdentityService.updatePrivacySettings(data.id, data.settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['providerProfile']);
      },
    }
  );

  return {
    profile,
    isLoadingProfile,
    error,
    createProfile,
    updateProfile,
    verifyAHPRA,
    verifyProviderNumber,
    verifyQualification,
    verifyInsurance,
    updatePrivacySettings,
  };
};

export default useProviderIdentity;
