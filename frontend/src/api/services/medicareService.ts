import { APIClient } from '../apiClient';

export interface MBSItem {
  itemNumber: string;
  description: string;
  fee: number;
  category: string;
  effectiveDate: string;
}

export interface PBSItem {
  itemCode: string;
  name: string;
  form: string;
  strength: string;
  price: number;
  maxQuantity: number;
  numberOfRepeats: number;
}

export interface MedicareClaim {
  id?: string;
  patientId: string;
  providerId: string;
  serviceDate: string;
  itemNumber: string;
  bulkBilled: boolean;
  fee: number;
  claimStatus?: 'pending' | 'submitted' | 'processed' | 'rejected';
  claimReference?: string;
}

export interface PBSPrescription {
  id?: string;
  patientId: string;
  prescriberId: string;
  itemCode: string;
  prescriptionDate: string;
  quantity: number;
  repeats: number;
  authority?: string;
  streamlined?: string;
  status: 'active' | 'completed' | 'cancelled';
}

class MedicareService {
  private static instance: MedicareService;
  private client: APIClient;
  private readonly baseUrl: string = 'https://api.healthbridge-au.com/medicare';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): MedicareService {
    if (!MedicareService.instance) {
      MedicareService.instance = new MedicareService();
    }
    return MedicareService.instance;
  }

  // MBS Operations
  async searchMBSItems(query: string): Promise<MBSItem[]> {
    return await this.client.get<MBSItem[]>(`${this.baseUrl}/mbs/search?q=${encodeURIComponent(query)}`);
  }

  async getMBSItem(itemNumber: string): Promise<MBSItem> {
    return await this.client.get<MBSItem>(`${this.baseUrl}/mbs/items/${itemNumber}`);
  }

  async submitMBSClaim(claim: MedicareClaim): Promise<MedicareClaim> {
    return await this.client.post<MedicareClaim>(`${this.baseUrl}/mbs/claims`, claim);
  }

  async getClaimStatus(claimId: string): Promise<MedicareClaim> {
    return await this.client.get<MedicareClaim>(`${this.baseUrl}/mbs/claims/${claimId}`);
  }

  // PBS Operations
  async searchPBSItems(query: string): Promise<PBSItem[]> {
    return await this.client.get<PBSItem[]>(`${this.baseUrl}/pbs/search?q=${encodeURIComponent(query)}`);
  }

  async getPBSItem(itemCode: string): Promise<PBSItem> {
    return await this.client.get<PBSItem>(`${this.baseUrl}/pbs/items/${itemCode}`);
  }

  async createPrescription(prescription: PBSPrescription): Promise<PBSPrescription> {
    return await this.client.post<PBSPrescription>(`${this.baseUrl}/pbs/prescriptions`, prescription);
  }

  async getPatientPrescriptions(patientId: string): Promise<PBSPrescription[]> {
    return await this.client.get<PBSPrescription[]>(`${this.baseUrl}/pbs/prescriptions/patient/${patientId}`);
  }

  // Authority Script Operations
  async requestAuthority(
    prescriptionId: string,
    reason: string,
    clinicalJustification: string
  ): Promise<{ authorityNumber: string }> {
    return await this.client.post(`${this.baseUrl}/pbs/authority`, {
      prescriptionId,
      reason,
      clinicalJustification,
    });
  }

  // Medicare Verification
  async verifyMedicareCard(
    medicareNumber: string,
    irn: string,
    firstName: string,
    lastName: string
  ): Promise<{ valid: boolean; expiryDate?: string }> {
    return await this.client.post(`${this.baseUrl}/verify`, {
      medicareNumber,
      irn,
      firstName,
      lastName,
    });
  }

  // Bulk Billing Operations
  async createBulkBillBatch(claims: MedicareClaim[]): Promise<{ batchId: string; status: string }> {
    return await this.client.post(`${this.baseUrl}/bulk-bill/batch`, { claims });
  }

  async getBulkBillBatchStatus(batchId: string): Promise<{
    batchId: string;
    status: string;
    processedClaims: number;
    totalClaims: number;
  }> {
    return await this.client.get(`${this.baseUrl}/bulk-bill/batch/${batchId}`);
  }
}
