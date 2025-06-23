import { useState, useEffect, useCallback } from 'react';
import { ClinicService } from '../services/ClinicService';

interface ClinicStats {
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingAppointments: number;
  unreadMessages: number;
  upcomingAppointments: number;
}

export const useClinicStats = () => {
  const [stats, setStats] = useState<ClinicStats>({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    unreadMessages: 0,
    upcomingAppointments: 0,
  });

  const clinicService = ClinicService.getInstance();

  const fetchStats = useCallback(async () => {
    try {
      const clinicStats = await clinicService.getClinicStats();
      setStats(clinicStats);
    } catch (error) {
      console.error('Error fetching clinic stats:', error);
    }
  }, [clinicService]);

  useEffect(() => {
    fetchStats();
    // Set up a refresh interval
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats };
};
