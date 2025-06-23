import { APIClient } from '../../api/apiClient';

export interface SNOMEDConcept {
  conceptId: string;
  term: string;
  active: boolean;
  effectiveTime: string;
  moduleId: string;
  definitionStatus: string;
  relationships?: Array<{
    type: {
      conceptId: string;
      term: string;
    };
    target: {
      conceptId: string;
      term: string;
    };
  }>;
}

export interface AMTProduct {
  code: string;
  name: string;
  type: 'CTPP' | 'TPP' | 'MPUU' | 'MPP' | 'MP';
  active: boolean;
  description: string;
  form?: string;
  strength?: string;
  unit?: string;
  components?: Array<{
    name: string;
    strength: string;
    unit: string;
  }>;
}

export interface ICD10AMCode {
  code: string;
  description: string;
  category: string;
  includes?: string[];
  excludes?: string[];
  notes?: string[];
  version: string;
}

class ClinicalCodingService {
  private static instance: ClinicalCodingService;
  private client: APIClient;
  private readonly baseUrl: string = 'https://api.healthbridge-au.com/terminology';

  private constructor() {
    this.client = APIClient.getInstance();
  }

  public static getInstance(): ClinicalCodingService {
    if (!ClinicalCodingService.instance) {
      ClinicalCodingService.instance = new ClinicalCodingService();
    }
    return ClinicalCodingService.instance;
  }

  // SNOMED CT-AU Operations
  async searchSNOMED(
    term: string,
    options?: {
      branch?: string;
      semanticTags?: string[];
      activeOnly?: boolean;
    }
  ): Promise<SNOMEDConcept[]> {
    const queryParams = new URLSearchParams({
      term,
      ...options as Record<string, string>,
    }).toString();
    return await this.client.get<SNOMEDConcept[]>(`${this.baseUrl}/snomed/search?${queryParams}`);
  }

  async getSNOMEDConcept(conceptId: string): Promise<SNOMEDConcept> {
    return await this.client.get<SNOMEDConcept>(`${this.baseUrl}/snomed/concepts/${conceptId}`);
  }

  async validateSNOMEDExpression(expression: string): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    return await this.client.post(`${this.baseUrl}/snomed/validate`, { expression });
  }

  // AMT Operations
  async searchAMT(
    query: string,
    filter?: {
      type?: AMTProduct['type'];
      active?: boolean;
    }
  ): Promise<AMTProduct[]> {
    const queryParams = new URLSearchParams({
      q: query,
      ...filter as Record<string, string>,
    }).toString();
    return await this.client.get<AMTProduct[]>(`${this.baseUrl}/amt/search?${queryParams}`);
  }

  async getAMTProduct(code: string): Promise<AMTProduct> {
    return await this.client.get<AMTProduct>(`${this.baseUrl}/amt/products/${code}`);
  }

  // ICD-10-AM Operations
  async searchICD10AM(
    query: string,
    options?: {
      category?: string;
      version?: string;
    }
  ): Promise<ICD10AMCode[]> {
    const queryParams = new URLSearchParams({
      q: query,
      ...options as Record<string, string>,
    }).toString();
    return await this.client.get<ICD10AMCode[]>(`${this.baseUrl}/icd10am/search?${queryParams}`);
  }

  async getICD10AMCode(code: string): Promise<ICD10AMCode> {
    return await this.client.get<ICD10AMCode>(`${this.baseUrl}/icd10am/codes/${code}`);
  }

  // Mapping Operations
  async mapSNOMEDToICD10AM(snomedConceptId: string): Promise<{
    source: SNOMEDConcept;
    mappings: Array<{
      target: ICD10AMCode;
      mapGroup: number;
      priority: number;
      rule?: string;
    }>;
  }> {
    return await this.client.get(`${this.baseUrl}/map/snomed-to-icd10am/${snomedConceptId}`);
  }

  async mapAMTToSNOMED(amtCode: string): Promise<{
    source: AMTProduct;
    mappings: SNOMEDConcept[];
  }> {
    return await this.client.get(`${this.baseUrl}/map/amt-to-snomed/${amtCode}`);
  }

  // Terminology Updates
  async checkForUpdates(): Promise<{
    snomed: { version: string; updateAvailable: boolean };
    amt: { version: string; updateAvailable: boolean };
    icd10am: { version: string; updateAvailable: boolean };
  }> {
    return await this.client.get(`${this.baseUrl}/updates/check`);
  }

  async applyUpdates(terminology: 'snomed' | 'amt' | 'icd10am'): Promise<{
    success: boolean;
    version: string;
    changes: {
      added: number;
      modified: number;
      inactivated: number;
    };
  }> {
    return await this.client.post(`${this.baseUrl}/updates/apply`, { terminology });
  }
}
