import { APIClient } from '../apiClient';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
}

const client = APIClient.getInstance();

export const fetchHealthRecords = async (filter: string) => {
  return await client.get(`/patient/records?filter=${filter}`);
};

export const uploadHealthRecord = async (formData: FormData) => {
  return await client.post('/patient/records', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteHealthRecord = async (recordId: string) => {
  return await client.delete(`/patient/records/${recordId}`);
};

export const shareHealthRecord = async ({ recordId, clinicIds }: { recordId: string; clinicIds: string[] }) => {
  return await client.post(`/patient/records/${recordId}/share`, { clinicIds });
};

export const fetchRecentPatients = async (): Promise<Patient[]> => {
  return await client.get('/patients/recent');
};
