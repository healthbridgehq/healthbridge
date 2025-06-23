import { useState, useCallback } from 'react';
import { useStore } from '../store';
import { APIError } from '../api/client';
import { healthService, HealthRecord } from '../api/services/healthService';

export const useHealthRecords = () => {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await healthService.getHealthRecords();
      dispatch({ type: 'SET_HEALTH_RECORDS', payload: records });
      return records;
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createRecord = useCallback(async (data: Partial<HealthRecord>) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await healthService.createHealthRecord(data);
      dispatch({ type: 'ADD_HEALTH_RECORD', payload: newRecord });
      return newRecord;
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to create health record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateRecord = useCallback(async (id: string, data: Partial<HealthRecord>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRecord = await healthService.updateHealthRecord(id, data);
      dispatch({ type: 'UPDATE_HEALTH_RECORD', payload: updatedRecord });
      return updatedRecord;
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await healthService.deleteHealthRecord(id);
      dispatch({ type: 'DELETE_HEALTH_RECORD', payload: id });
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to delete health record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch, state.healthRecords]);

  return {
    records: state.healthRecords,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};
