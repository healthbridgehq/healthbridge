import { APIClient } from '../apiClient';
import { Patient, Observation, Medication, MedicationStatement } from '../../types/fhir';

class FHIRService {
  private static instance: FHIRService;
  private client: APIClient;
  private readonly baseUrl: string = 'https://api.healthbridge-au.com/fhir';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): FHIRService {
    if (!FHIRService.instance) {
      FHIRService.instance = new FHIRService();
    }
    return FHIRService.instance;
  }

  // Patient Resource Operations
  async getPatient(id: string): Promise<Patient> {
    return await this.client.get<Patient>(`${this.baseUrl}/Patient/${id}`);
  }

  async createPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    return await this.client.post<Patient>(`${this.baseUrl}/Patient`, patient);
  }

  async updatePatient(id: string, patient: Patient): Promise<Patient> {
    return await this.client.put<Patient>(`${this.baseUrl}/Patient/${id}`, patient);
  }

  // Observation Resource Operations
  async getObservation(id: string): Promise<Observation> {
    return await this.client.get<Observation>(`${this.baseUrl}/Observation/${id}`);
  }

  async createObservation(observation: Omit<Observation, 'id'>): Promise<Observation> {
    return await this.client.post<Observation>(`${this.baseUrl}/Observation`, observation);
  }

  async getPatientObservations(patientId: string): Promise<Observation[]> {
    return await this.client.get<Observation[]>(`${this.baseUrl}/Observation?subject=Patient/${patientId}`);
  }

  // Medication Resource Operations
  async getMedication(id: string): Promise<Medication> {
    return await this.client.get<Medication>(`${this.baseUrl}/Medication/${id}`);
  }

  async createMedication(medication: Omit<Medication, 'id'>): Promise<Medication> {
    return await this.client.post<Medication>(`${this.baseUrl}/Medication`, medication);
  }

  // MedicationStatement Resource Operations
  async getMedicationStatement(id: string): Promise<MedicationStatement> {
    return await this.client.get<MedicationStatement>(`${this.baseUrl}/MedicationStatement/${id}`);
  }

  async createMedicationStatement(statement: Omit<MedicationStatement, 'id'>): Promise<MedicationStatement> {
    return await this.client.post<MedicationStatement>(`${this.baseUrl}/MedicationStatement`, statement);
  }

  async getPatientMedicationStatements(patientId: string): Promise<MedicationStatement[]> {
    return await this.client.get<MedicationStatement[]>(`${this.baseUrl}/MedicationStatement?subject=Patient/${patientId}`);
  }

  // My Health Record Operations
  async syncWithMyHealthRecord(patientId: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/MyHealthRecord/sync`, { patientId });
  }

  async uploadToMyHealthRecord(resourceType: string, resourceId: string): Promise<void> {
    await this.client.post(`${this.baseUrl}/MyHealthRecord/upload`, {
      resourceType,
      resourceId,
    });
  }

  // Healthcare Identifiers Service Operations
  async verifyIHI(ihi: string): Promise<boolean> {
    const response = await this.client.post<{ valid: boolean }>(`${this.baseUrl}/HI/verify`, { ihi });
    return response.valid;
  }

  async lookupHPI(hpiNumber: string, type: 'individual' | 'organization'): Promise<any> {
    return await this.client.get(`${this.baseUrl}/HI/lookup/${type}/${hpiNumber}`);
  }
}
