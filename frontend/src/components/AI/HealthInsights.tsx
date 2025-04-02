import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  Info,
  Refresh,
  WarningAmber,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import analytics from '../../utils/analytics';

interface HealthInsight {
  category: string;
  description: string;
  severity: 'info' | 'warning' | 'alert';
  timestamp: string;
}

interface HealthTrend {
  metric: string;
  value: number;
  change: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const HealthInsights: React.FC = () => {
interface InsightsResponse {
  insights: HealthInsight[];
  trends: HealthTrend[];
}

  const { data, isLoading, error, refetch } = useQuery<InsightsResponse, Error>({
    queryKey: ['healthInsights'],
    queryFn: async () => {
      const response = await api.get<InsightsResponse>('/ai/health-insights');
      analytics.trackEvent({
        category: 'AI',
        action: 'Fetch Health Insights',
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => refetch()}
          >
            <Refresh />
          </IconButton>
        }
      >
        Failed to load health insights
      </Alert>
    );
  }

  const { insights, trends } = data || { insights: [], trends: [] };

  return (
    <Grid container spacing={3}>
      {/* Trends Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Health Trends</Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={() => refetch()}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            <Grid container spacing={2}>
              {trends.map((trend: HealthTrend) => (
                <Grid item xs={12} sm={6} md={4} key={trend.metric}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" color="textSecondary">
                            {trend.metric}
                          </Typography>
                          <TrendingUp
                            color={trend.trend === 'increasing' ? 'primary' : 'action'}
                          />
                        </Box>
                        <Typography variant="h5" component="div">
                          {trend.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={trend.trend === 'stable' ? 'textSecondary' : 'primary'}
                        >
                          {trend.change > 0 ? '+' : ''}{trend.change}% from last period
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Insights Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI-Generated Insights
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {insights.map((insight: HealthInsight, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={insight.category}
                          size="small"
                          color={
                            insight.severity === 'alert'
                              ? 'error'
                              : insight.severity === 'warning'
                              ? 'warning'
                              : 'info'
                          }
                        />
                        {insight.severity === 'alert' && (
                          <WarningAmber color="error" fontSize="small" />
                        )}
                      </Box>
                      <Typography variant="body1">{insight.description}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Generated: {new Date(insight.timestamp).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Disclaimer */}
      <Grid item xs={12}>
        <Alert
          severity="info"
          icon={<Info />}
          sx={{ mt: 2 }}
        >
          These insights are generated by AI and should not replace professional medical advice.
          Always consult with your healthcare provider before making any health-related decisions.
        </Alert>
      </Grid>
    </Grid>
  );
};

export default HealthInsights;
