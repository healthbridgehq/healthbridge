import { useState, useCallback } from 'react';
import { useStore } from '../store';
import api, { ApiError } from '../services/api';
import { HealthRecord } from '../types';

export const useHealthRecords = () => {
  const { state, dispatch } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.healthRecords.getAll();
      dispatch({ type: 'SET_HEALTH_RECORDS', payload: response.data });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const createRecord = useCallback(async (data: Partial<HealthRecord>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.healthRecords.create(data);
      dispatch({ type: 'ADD_HEALTH_RECORD', payload: response.data });
      return response.data;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create health record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateRecord = useCallback(async (id: string, data: Partial<HealthRecord>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.healthRecords.update(id, data);
      dispatch({ type: 'UPDATE_HEALTH_RECORD', payload: response.data });
      return response.data;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update health record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.healthRecords.delete(id);
      dispatch({
        type: 'SET_HEALTH_RECORDS',
        payload: state.healthRecords.filter(record => record.id !== id)
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete health record');
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
