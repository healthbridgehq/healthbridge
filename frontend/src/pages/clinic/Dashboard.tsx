import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Grid,
  Paper,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Chip,
  ListItemSecondaryAction,
  Box,
  Stack,
} from '@mui/material';
import {
  Refresh,
  ArrowForward,
  Info,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatTime, formatCurrency, formatDate } from '../../utils';
import {
  fetchTodayAppointments,
  fetchClinicMetrics,
  fetchRecentPatients,
  fetchBillingOverview,
  Appointment,
  ClinicMetrics,
  Patient,
  BillingOverview,
} from '../../api/services';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch today's appointments
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery<Appointment[]>('todayAppointments', () => fetchTodayAppointments(), {
    refetchInterval: 60000,
  });

  const { data: metrics } = useQuery<ClinicMetrics>('clinicMetrics', () => fetchClinicMetrics(), {
    refetchInterval: 300000,
  });

  const { data: recentPatients = [] } = useQuery<Patient[]>('recentPatients', () => fetchRecentPatients(), {
    refetchInterval: 300000,
  });

  const { data: billingOverview } = useQuery<BillingOverview>('billingOverview', () => fetchBillingOverview(), {
    refetchInterval: 300000,
  });

  const renderAppointments = () => (
    <Card>
      <CardHeader
        title="Today's Appointments"
        action={
          <>
            <IconButton onClick={() => queryClient.invalidateQueries('todayAppointments')}>
              <Refresh />
            </IconButton>
            <Button
              variant="text"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/clinic/appointments')}
            >
              View All
            </Button>
          </>
        }
      />
      <CardContent>
        {appointments.length > 0 ? (
          <List>
            {appointments.map((appointment) => (
              <ListItem key={appointment.id}>
                <ListItemText
                  primary={appointment.patientName}
                  secondary={formatTime(appointment.scheduledTime)}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={appointment.status}
                    color={appointment.status === 'confirmed' ? 'success' : 'default'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary">No appointments today</Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderMetrics = () => (
    <Card>
      <CardHeader
        title="Clinic Metrics"
        action={
          <IconButton onClick={() => queryClient.invalidateQueries('clinicMetrics')}>
            <Refresh />
          </IconButton>
        }
      />
      <CardContent>
        {metrics ? (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{metrics.totalPatients}</Typography>
                <Typography variant="body2" color="text.secondary">Total Patients</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{metrics.totalAppointments}</Typography>
                <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{metrics.averageRating.toFixed(1)}</Typography>
                <Typography variant="body2" color="text.secondary">Average Rating</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{formatCurrency(metrics.revenueMetrics.currentRevenue)}</Typography>
                <Typography variant="body2" color="text.secondary">Current Revenue</Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography color="textSecondary">
            No metrics available
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderRecentPatients = () => (
    <Card>
      <CardHeader
        title="Recent Patients"
        action={
          <>
            <IconButton onClick={() => queryClient.invalidateQueries('recentPatients')}>
              <Refresh />
            </IconButton>
            <Button
              variant="text"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/clinic/patients')}
            >
              View All
            </Button>
          </>
        }
      />
      <CardContent>
        {recentPatients ? (
          <List>
            {recentPatients.map((patient) => (
              <ListItem key={patient.id}>
                <ListItemText
                  primary={patient.name}
                  secondary={`Last visit: ${formatDate(patient.dateOfBirth)}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => navigate(`/clinic/patients/${patient.id}`)}>
                    <Info />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary">
            No recent patients
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderBillingOverview = () => (
    <Card>
      <CardHeader
        title="Billing Overview"
        action={
          <>
            <IconButton onClick={() => queryClient.invalidateQueries('billingOverview')}>
              <Refresh />
            </IconButton>
            <Button
              color="primary"
              onClick={() => navigate('/clinic/billing')}
            >
              View Details
            </Button>
          </>
        }
      />
      <CardContent>
        {billingOverview ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {formatCurrency(billingOverview.currentRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Month Revenue
                </Typography>
                {billingOverview.revenueChange && (
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mt={1}>
                    <TrendingUp
                      color={billingOverview.revenueChange > 0 ? "success" : "error"}
                      fontSize="small"
                    />
                    <Typography
                      variant="caption"
                      color={billingOverview.revenueChange > 0 ? "success" : "error"}
                    >
                      {billingOverview.revenueChange}% from last month
                    </Typography>
                  </Stack>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color={billingOverview.outstandingAmount > 0 ? "error" : "success"}>
                  {formatCurrency(billingOverview.outstandingAmount)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Outstanding Amount
                </Typography>
                <Box sx={{ p: 2 }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate('/clinic/billing/outstanding')}
                  >
                    View Invoices
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography color="textSecondary">
            No billing information available
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Clinic Dashboard
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          {renderMetrics()}
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderAppointments()}
            </Grid>
            <Grid item xs={12}>
              {renderRecentPatients()}
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {renderBillingOverview()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
