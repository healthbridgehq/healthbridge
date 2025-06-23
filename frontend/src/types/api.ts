export interface ClinicAnalytics {
  appointments: {
    stats: {
      total: number;
      completed: number;
      cancelled: number;
      noShow: number;
      ageDistribution: Array<{ range: string; count: number }>;
    };
    trends: Array<{
      date: string;
      appointments: number;
    }>;
    distribution: Array<{
      type: string;
      count: number;
    }>;
    satisfaction: Array<{
      rating: number;
      count: number;
    }>;
  };
  patients: {
    stats: {
      total: number;
      active: number;
      new: number;
      returning: number;
      ageDistribution: Array<{ range: string; count: number }>;
    };
    demographics: Array<{
      date: string;
      patients: number;
    }>;
    retention: Array<{
      condition: string;
      count: number;
    }>;
  };
  revenue: {
    stats: {
      total: number;
      average: number;
      growth: number;
      byPaymentMethod: Array<{
        method: string;
        value: number;
      }>;
    };
    trends: Array<{
      date: string;
      revenue: number;
      expenses: number;
    }>;
    byService: Array<{
      service: string;
      value: number;
    }>;
    projections: Array<{
      date: string;
      revenue: number;
      expenses: number;
    }>;
  };
  performance: {
    metrics: Array<{
      name: string;
      value: number;
      unit: string;
      change?: number;
    }>;
  };
}
