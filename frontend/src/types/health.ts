export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'alert';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  referenceRange?: {
    min: number;
    max: number;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
  prescribedBy: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
}

export interface Condition {
  id: string;
  name: string;
  status: 'active' | 'resolved' | 'inactive';
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate: string;
  lastReviewed?: string;
  diagnosedBy: string;
  symptoms?: string[];
  treatments?: string[];
  notes?: string;
}

export interface HealthEvent {
  id: string;
  type: 'appointment' | 'prescription' | 'pathology' | 'imaging' | 'document' | 'hospital';
  date: string;
  title: string;
  description: string;
  provider: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  details?: Record<string, any>;
  location?: string;
  duration?: number;
  documents?: HealthDocument[];
}

export interface HealthDocument {
  id: string;
  title: string;
  type: string;
  date: string;
  provider: string;
  source: string;
  status: 'available' | 'pending' | 'restricted';
  category: string;
  size: number;
  lastAccessed?: string;
  mimeType: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface HealthSummary {
  metrics: HealthMetric[];
  medications: Medication[];
  conditions: Condition[];
  importantNotes?: string;
  lastUpdated: string;
}

export interface VitalSigns {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    timestamp: string;
  };
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  timestamp: string;
}
