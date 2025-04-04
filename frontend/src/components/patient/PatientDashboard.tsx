import React from 'react';
import { Box, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import { HealthTimeline } from './HealthTimeline';
import { ConsentManager } from './ConsentManager';
import { UpcomingAppointments } from './UpcomingAppointments';
import { HealthSummary } from './HealthSummary';
import { DocumentManager } from './DocumentManager';
import { usePatientData } from '../../hooks/usePatientData';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

export const PatientDashboard: React.FC = () => {
  const theme = useTheme();
  const { data: patientData, isLoading, error } = usePatientData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {patientData?.firstName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your health information and appointments in one secure place.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Health Summary Card */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 240,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <HealthSummary patientId={patientData?.id} />
          </Paper>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 240,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <UpcomingAppointments patientId={patientData?.id} />
          </Paper>
        </Grid>

        {/* Health Timeline */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 400,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <HealthTimeline patientId={patientData?.id} />
          </Paper>
        </Grid>

        {/* Document Manager */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 300,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <DocumentManager patientId={patientData?.id} />
          </Paper>
        </Grid>

        {/* Consent Manager */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 300,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            <ConsentManager patientId={patientData?.id} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
