import type { AxiosResponse as Response } from 'axios';

export type AxiosResponse<T = any> = Response<T>;

// Common Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Common Request Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// Utility Types
export type ApiResult<T> = Promise<AxiosResponse<ApiResponse<T>>>;

// Service Response Types
export interface ServiceResponse<T> {
  data: T;
  error?: ApiError;
  loading?: boolean;
}

// Common Entity Types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// Common Status Types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed';

// Common Permission Types
export interface Permission {
  action: string;
  subject: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// Security Types
export interface SecurityContext {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  scopes: string[];
  tenant?: string;
}

// Compliance Types
export interface ComplianceCheck {
  id: string;
  type: string;
  status: 'compliant' | 'non_compliant' | 'warning';
  message?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ComplianceReport {
  id: string;
  checks: ComplianceCheck[];
  summary: {
    total: number;
    compliant: number;
    nonCompliant: number;
    warnings: number;
  };
  timestamp: string;
}

// Integration Types
export interface IntegrationConfig {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  status: 'active' | 'inactive';
  lastSync?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

// Analytics Types
export interface AnalyticsMetric {
  name: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  period?: string;
}

export interface AnalyticsDataPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface AnalyticsTimeSeries {
  metric: string;
  data: AnalyticsDataPoint[];
  aggregation?: string;
  period?: string;
}

// Settings Types
export interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
  };
  security: {
    mfaRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expiryDays?: number;
    };
    sessionTimeout: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: {
    userGroups?: string[];
    percentage?: number;
    startDate?: string;
    endDate?: string;
  };
}
