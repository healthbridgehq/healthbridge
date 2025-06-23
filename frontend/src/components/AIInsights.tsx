import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import axios from 'axios';
import { authService } from '../api/services/authService';

interface HealthTrends {
  risk_score: number;
  privacy_guarantee: string;
  confidence: number;
}

const AIInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<HealthTrends | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        interface ApiResponse {
          status: string;
          data: HealthTrends;
          privacy_notice: string;
        }

        const response = await axios.get<ApiResponse>(
          'http://localhost:8000/ai/health-trends',
          {
            headers: {
              ...authService.getAuthHeader(),
            },
          }
        );
        setInsights(response.data.data);
      } catch (err) {
        setError('Failed to fetch AI insights');
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Health Insights
        </Typography>
        {insights && (
          <>
            <Typography color="textSecondary" gutterBottom>
              Risk Score: {(insights.risk_score * 100).toFixed(1)}%
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Confidence: {(insights.confidence * 100).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Privacy Guarantee: {insights.privacy_guarantee}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
