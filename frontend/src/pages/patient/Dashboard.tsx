import React from 'react';
import { useQuery } from 'react-query';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  LocalHospital,
  Assignment,
  Notifications,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchUpcomingAppointments, fetchHealthMetrics, fetchRecentDocuments } from '../../services/api/patient';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { HealthRecord, Appointment, HealthMetric } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch upcoming appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery(
    'upcomingAppointments',
    fetchUpcomingAppointments
  );

  // Fetch health metrics
  const { data: healthMetrics, isLoading: metricsLoading } = useQuery(
    'healthMetrics',
    fetchHealthMetrics
  );

  // Fetch recent documents
  const { data: recentDocuments, isLoading: documentsLoading } = useQuery(
    'recentDocuments',
    fetchRecentDocuments
  );

  const renderAppointments = () => (
    <Card>
      <CardHeader
        title="Upcoming Appointments"
        action={
          <Button
            color="primary"
            onClick={() => navigate('/patient/appointments')}
          >
            View All
          </Button>
        }
      />
      <CardContent>
        {appointmentsLoading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : appointments?.length ? (
          <List>
            {appointments.slice(0, 3).map((appointment: Appointment) => (
              <ListItem key={appointment.id}>
                <ListItemIcon>
                  <EventIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={appointment.type}
                  secondary={`${formatDate(appointment.date)} at ${formatTime(appointment.time)}`}
                />
                <Chip
                  label={appointment.clinic.name}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary">
            No upcoming appointments
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderHealthMetrics = () => (
    <Card>
      <CardHeader
        title="Health Metrics"
        action={
          <Button
            color="primary"
            onClick={() => navigate('/patient/insights')}
          >
            View Insights
          </Button>
        }
      />
      <CardContent>
        {metricsLoading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : healthMetrics ? (
          <Grid container spacing={2}>
            {Object.entries(healthMetrics as Record<string, HealthMetric>).map(([key, value]) => (
              <Grid item xs={6} key={key}>
                <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {value.value}
                    {value.unit}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {value.label}
                  </Typography>
                  {value.trend && (
                    <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                      <TrendingUp
                        color={value.trend > 0 ? "success" : "error"}
                        fontSize="small"
                      />
                      <Typography
                        variant="caption"
                        color={value.trend > 0 ? "success" : "error"}
                      >
                        {value.trend}%
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">
            No health metrics available
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderRecentDocuments = () => (
    <Card>
      <CardHeader
        title="Recent Documents"
        action={
          <Button
            color="primary"
            onClick={() => navigate('/patient/health-records')}
          >
            View All
          </Button>
        }
      />
      <CardContent>
        {documentsLoading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : recentDocuments?.length ? (
          <List>
            {recentDocuments.slice(0, 3).map((document: HealthRecord) => (
              <ListItem key={document.id}>
                <ListItemIcon>
                  <Assignment color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={document.title}
                  secondary={`Added on ${formatDate(document.dateAdded)}`}
                />
                <Chip
                  label={document.type}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary">
            No recent documents
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader title="Quick Actions" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => navigate('/patient/appointments/book')}
            >
              Book Appointment
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LocalHospital />}
              onClick={() => navigate('/patient/ai-assistant')}
            >
              Ask AI Assistant
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => navigate('/patient/health-records/upload')}
            >
              Upload Document
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Notifications />}
              onClick={() => navigate('/patient/data-sharing')}
            >
              Manage Sharing
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Welcome back!
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderAppointments()}
            </Grid>
            <Grid item xs={12}>
              {renderHealthMetrics()}
            </Grid>
            <Grid item xs={12}>
              {renderRecentDocuments()}
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {renderQuickActions()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
