import React from 'react';
import { Grid, Typography, useTheme, useMediaQuery, Box } from '@mui/material';
import VitalsChart from '../charts/VitalsChart';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import TrendSparkline from '../charts/TrendSparkline';
import AnimatedCard from '../common/AnimatedCard';
import TransitionContainer from '../common/TransitionContainer';

const HealthDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Example data - replace with real data from your API
  const bloodPressureData = [
    { timestamp: '2025-03-28T09:00:00', value: 120, normalRangeLow: 90, normalRangeHigh: 120 },
    { timestamp: '2025-03-29T09:30:00', value: 118, normalRangeLow: 90, normalRangeHigh: 120 },
    { timestamp: '2025-03-30T10:00:00', value: 122, normalRangeLow: 90, normalRangeHigh: 120 },
    { timestamp: '2025-03-31T09:15:00', value: 119, normalRangeLow: 90, normalRangeHigh: 120 },
    { timestamp: '2025-04-01T09:45:00', value: 121, normalRangeLow: 90, normalRangeHigh: 120 },
    { timestamp: '2025-04-02T10:30:00', value: 117, normalRangeLow: 90, normalRangeHigh: 120 },
    { timestamp: '2025-04-03T09:00:00', value: 120, normalRangeLow: 90, normalRangeHigh: 120 },
  ];

  const heartRateData = [
    { timestamp: '2025-04-03T06:00:00', value: 72, normalRangeLow: 60, normalRangeHigh: 100 },
    { timestamp: '2025-04-03T07:00:00', value: 75, normalRangeLow: 60, normalRangeHigh: 100 },
    { timestamp: '2025-04-03T08:00:00', value: 78, normalRangeLow: 60, normalRangeHigh: 100 },
    { timestamp: '2025-04-03T09:00:00', value: 73, normalRangeLow: 60, normalRangeHigh: 100 },
    { timestamp: '2025-04-03T10:00:00', value: 71, normalRangeLow: 60, normalRangeHigh: 100 },
  ];

  const visitFrequencyData = [
    { name: 'Jan', value: 4 },
    { name: 'Feb', value: 3 },
    { name: 'Mar', value: 5 },
    { name: 'Apr', value: 2 },
  ];

  const healthRecordsData = [
    { name: 'Medical History', value: 35, color: theme.palette.primary.main },
    { name: 'Lab Results', value: 25, color: theme.palette.secondary.main },
    { name: 'Prescriptions', value: 20, color: theme.palette.medical.main },
    { name: 'Imaging', value: 15, color: '#90caf9' },
    { name: 'Other', value: 5, color: '#81c784' },
  ];

  // Trend data for sparklines
  const weightTrendData = [75.5, 75.2, 75.0, 74.8, 74.9, 74.7, 74.6];
  const glucoseTrendData = [95, 98, 92, 96, 95, 93, 94];
  const oxygenTrendData = [98, 97, 98, 98, 99, 98, 98];

  return (
    <TransitionContainer animation="slideUp">
      <Box sx={{ px: isMobile ? 2 : 3, py: isMobile ? 2 : 4 }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          gutterBottom
          sx={{ mb: isMobile ? 2 : 4 }}
        >
          Health Overview
        </Typography>

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Quick Stats */}
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={6} sm={3}>
              <TrendSparkline
                data={weightTrendData}
                label="Weight"
                value="74.6"
                unit="kg"
                trend="down"
                color={theme.palette.success.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TrendSparkline
                data={glucoseTrendData}
                label="Glucose"
                value="94"
                unit="mg/dL"
                trend="stable"
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TrendSparkline
                data={oxygenTrendData}
                label="Oxygen"
                value="98"
                unit="%"
                trend="up"
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <AnimatedCard animate="scale" delay={0.2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Next Appointment
                </Typography>
                <Typography variant="h6" color="secondary" sx={{ mb: 1 }}>
                  Apr 15
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Annual Check-up
                </Typography>
              </AnimatedCard>
            </Grid>
          </Grid>

          {/* Vitals Charts */}
          <Grid item xs={12} lg={8} container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <VitalsChart
                title="Blood Pressure"
                description="Systolic blood pressure readings over time"
                data={bloodPressureData}
                unit="mmHg"
                type="blood-pressure"
                normalRange={{ low: 90, high: 120 }}
              />
            </Grid>
            <Grid item xs={12}>
              <VitalsChart
                title="Heart Rate"
                description="Heart rate measurements today"
                data={heartRateData}
                unit="bpm"
                type="heart-rate"
                normalRange={{ low: 60, high: 100 }}
              />
            </Grid>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} lg={4} container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6} lg={12}>
              <BarChart
                title="Monthly Visits"
                description="Number of clinic visits per month"
                data={visitFrequencyData}
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={12}>
              <PieChart
                title="Health Records"
                description="Distribution of record types"
                data={healthRecordsData}
              />
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <AnimatedCard animate="slideUp" delay={0.4}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Grid container spacing={2}>
                {["Lab results received - Blood Work", "Prescription renewed - Medication X", "Appointment completed - Dr. Smith"].map((activity, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">
                        • {activity}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AnimatedCard>
          </Grid>
        </Grid>
      </Box>
    </TransitionContainer>
  );
};

export default HealthDashboard;
