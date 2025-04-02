import React from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import {

  Refresh,
  WarningAmber,
  CheckCircle,

} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Card from '../common/Card';
import DataCard from '../common/DataCard';
import StatusChip, { StatusType } from '../common/StatusChip';

// Type for health insights data
type HealthInsight = {
  category: string;
  description: string;
  severity: StatusType;
  timestamp: string;
}

type HealthTrendDirection = 'increasing' | 'decreasing' | 'stable';

// Type for health trend data
type HealthTrend = {
  metric: string;
  value: number;
  change: number;
  trend: HealthTrendDirection;
}

const MotionBox = motion(Box);

const HealthInsights: React.FC = () => {
  const theme = useTheme();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['healthInsights'],
    queryFn: async () => {
      // Replace with actual API call
      const response: { insights: HealthInsight[]; trends: HealthTrend[] } = {
        insights: [
          {
            category: 'Patient Engagement',
            description: 'Patient engagement rate has increased by 15% this month',
            severity: 'success' as StatusType,
            timestamp: new Date().toISOString(),
          },
          {
            category: 'Treatment Adherence',
            description: 'Some patients are missing scheduled appointments',
            severity: 'warning' as StatusType,
            timestamp: new Date().toISOString(),
          },
        ],
        trends: [
          {
            metric: 'Patient Satisfaction',
            value: 92,
            change: 5,
            trend: 'increasing' as const,
          },
          {
            metric: 'Treatment Success Rate',
            value: 88,
            change: 3,
            trend: 'increasing' as const,
          },
          {
            metric: 'Average Recovery Time',
            value: 12,
            change: -2,
            trend: 'decreasing' as const,
          },
        ],
      };
      return response;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <WarningAmber sx={{ color: theme.palette.warning.main }} />;
      case 'error':
        return <WarningAmber sx={{ color: theme.palette.error.main }} />;
      default:
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Health Insights
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered analysis of your healthcare metrics
          </Typography>
        </Box>
        <Tooltip title="Refresh insights">
          <IconButton onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Metrics Overview */}
        {data?.trends.map((trend, index) => (
          <Grid component="div" item xs={12} md={4} key={trend.metric}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DataCard
                title={trend.metric}
                value={trend.metric.includes('Time') ? `${trend.value} days` : `${trend.value}%`}
                trend={{
                  // Explicitly type the direction to match DataCard's expected type
                  value: trend.change,
                  direction: trend.trend.startsWith('increase') ? 'up' as const : 'down' as const,
                  label: 'vs last month',
                }}
                loading={isLoading}
              />
            </MotionBox>
          </Grid>
        ))}

        {/* Recent Insights */}
        <Grid component="div" item xs={12}>
          <Card
            title="Recent Insights"
            subtitle="AI-generated insights based on your healthcare data"
            loading={isLoading}
          >
            <Box sx={{ mt: 2 }}>
              {data?.insights.map((insight, index) => (
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 2,
                      borderBottom:
                        index < data.insights.length - 1
                          ? `1px solid ${theme.palette.divider}`
                          : 'none',
                    }}
                  >
                    <Box sx={{ mr: 2 }}>{getSeverityIcon(insight.severity)}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mr: 1 }}
                        >
                          {insight.category}
                        </Typography>
                        <StatusChip
                          status={insight.severity}
                          size="small"
                          label={insight.severity}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthInsights;
