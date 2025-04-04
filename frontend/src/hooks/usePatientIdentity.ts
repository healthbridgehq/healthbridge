import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientIdentityService } from '../services/patientIdentity';
import { useAuth } from './useAuth';

export const usePatientIdentity = (patientId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get the patient ID either from props or current user if they are a patient
  const targetPatientId = patientId || (user?.role === 'patient' ? user.id : undefined);

  // Fetch patient profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ['patientProfile', targetPatientId],
    queryFn: () => patientIdentityService.getProfile(targetPatientId!),
    enabled: !!targetPatientId,
  });

  // Create profile mutation
  const { mutateAsync: createProfile } = useMutation({
    mutationFn: patientIdentityService.createProfile,
    onSuccess: (newProfile) => {
      queryClient.setQueryData(['patientProfile', newProfile.id], newProfile);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Update profile mutation
  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      patientIdentityService.updateProfile(id, updates),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['patientProfile', updatedProfile.id], updatedProfile);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Update privacy settings mutation
  const { mutateAsync: updatePrivacySettings } = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: any }) =>
      patientIdentityService.updatePrivacySettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries(['patientProfile', targetPatientId]);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Verify identity documents mutation
  const { mutateAsync: verifyDocuments } = useMutation({
    mutationFn: ({ id, documents }: { id: string; documents: any }) =>
      patientIdentityService.verifyIdentityDocuments(id, documents),
    onSuccess: () => {
      queryClient.invalidateQueries(['patientProfile', targetPatientId]);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Provider access mutations
  const { mutateAsync: grantAccess } = useMutation({
    mutationFn: ({
      patientId,
      providerId,
      accessLevel,
    }: {
      patientId: string;
      providerId: string;
      accessLevel: 'full' | 'partial' | 'emergency';
    }) => patientIdentityService.grantProviderAccess(patientId, providerId, accessLevel),
    onSuccess: () => {
      queryClient.invalidateQueries(['patientProfile', targetPatientId]);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const { mutateAsync: revokeAccess } = useMutation({
    mutationFn: ({ patientId, providerId }: { patientId: string; providerId: string }) =>
      patientIdentityService.revokeProviderAccess(patientId, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['patientProfile', targetPatientId]);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Fetch audit trail
  const {
    data: auditTrail,
    isLoading: isLoadingAudit,
    error: auditError,
  } = useQuery({
    queryKey: ['patientAudit', targetPatientId],
    queryFn: () => patientIdentityService.getIdentityAuditTrail(targetPatientId!),
    enabled: !!targetPatientId,
  });

  // Verify IHI number
  const verifyIHI = useCallback(
    async (ihi: string) => {
      try {
        const isValid = await patientIdentityService.verifyIHI(ihi);
        setError(null);
        return isValid;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    []
  );

  // Verify Medicare details
  const verifyMedicare = useCallback(
    async (details: { number: string; irn: string; expiryDate: string }) => {
      try {
        const isValid = await patientIdentityService.verifyMedicare(details);
        setError(null);
        return isValid;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    []
  );

  return {
    profile,
    isLoadingProfile,
    profileError,
    auditTrail,
    isLoadingAudit,
    auditError,
    error,
    createProfile,
    updateProfile,
    updatePrivacySettings,
    verifyDocuments,
    grantAccess,
    revokeAccess,
    verifyIHI,
    verifyMedicare,
  };
};
