import React from 'react';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Card as MuiCard,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/common/Card';
import DataCard from '../components/common/DataCard';

const MotionBox = motion(Box);

const Analytics: React.FC = () => {
  const theme = useTheme();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        metrics: [
          {
            title: 'Total Patients',
            value: '2,547',
            trend: {
              value: 12.5,
              direction: 'up' as const,
              label: '+12.5%',
            },
            period: 'vs last month',
          },
          {
            title: 'Patient Satisfaction',
            value: '94.2%',
            trend: {
              value: 2.1,
              direction: 'up' as const,
              label: '+2.1%',
            },
            period: 'vs last month',
          },
          {
            title: 'Avg. Wait Time',
            value: '14.3m',
            trend: {
              value: -8.3,
              direction: 'down' as const,
              label: '-8.3%',
            },
            period: 'vs last month',
          },
          {
            title: 'Revenue',
            value: '$284.5k',
            trend: {
              value: 15.2,
              direction: 'up' as const,
              label: '+15.2%',
            },
            period: 'vs last month',
          },
        ],
        charts: {
          patientGrowth: {
            // Chart data would go here
          },
          satisfaction: {
            // Chart data would go here
          },
        },
      };
    },
  });

  return (
    <Box>
      {/* Header Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <IconButton onClick={() => refetch()} disabled={isLoading}>
            <Refresh />
          </IconButton>
        </Box>
      </MotionBox>

      {/* Metrics Grid */}
      <Grid container spacing={3}>
        {data?.metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DataCard
                title={metric.title}
                value={metric.value}
                trend={metric.trend}
                subtitle={metric.period}
                loading={isLoading}
              />
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Card
            title="Patient Growth"
            subtitle="Monthly patient acquisition and churn"
            loading={isLoading}
          >
            {/* Add Chart Component here */}
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Chart Placeholder</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            title="Patient Satisfaction"
            subtitle="Overall satisfaction score trends"
            loading={isLoading}
          >
            {/* Add Chart Component here */}
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Chart Placeholder</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
