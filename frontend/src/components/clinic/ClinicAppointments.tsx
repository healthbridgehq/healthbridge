import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Event as EventIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import AppointmentScheduler from '../shared/AppointmentScheduler';
import { useClinicStaff } from '../../hooks/useClinicStaff';
import { colors } from '../../theme/colors';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ClinicAppointments: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = React.useState(0);
  const { staffData } = useClinicStaff();
  const [selectedDoctor, setSelectedDoctor] = React.useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAppointmentScheduled = (appointmentId: string) => {
    // Refresh clinic data to show new appointment
    // This will be handled by the useClinicStaff hook's cache invalidation
  };

  // Group appointments by date for the calendar view
  const appointmentsByDate = staffData?.appointments.reduce((acc, appointment) => {
    const date = appointment.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, any[]>);

  const getAppointmentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="appointment tabs"
        >
          <Tab
            icon={<TodayIcon />}
            label="Today's Schedule"
            iconPosition="start"
          />
          <Tab
            icon={<CalendarIcon />}
            label="Calendar View"
            iconPosition="start"
          />
          <Tab
            icon={<EventIcon />}
            label="Schedule Appointment"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Today's Schedule */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {staffData?.doctors.map((doctor) => (
            <Grid item xs={12} md={6} key={doctor.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={doctor.avatar}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Typography variant="h6">{doctor.name}</Typography>
                  </Box>
                  
                  {doctor.todayAppointments?.map((appointment) => (
                    <Box
                      key={appointment.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="subtitle1">
                          {appointment.time} - {appointment.patient.name}
                        </Typography>
                        <Box>
                          {appointment.type === 'telehealth' && (
                            <Tooltip title="Telehealth Appointment">
                              <IconButton size="small">
                                <VideoCallIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Chip
                            size="small"
                            label={appointment.status}
                            color={getAppointmentStatusColor(appointment.status)}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {appointment.type}
                      </Typography>
                      {appointment.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Notes: {appointment.notes}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <Tooltip title="Edit Appointment">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as Complete">
                          <IconButton size="small" color="success">
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Appointment">
                          <IconButton size="small" color="error">
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Calendar View */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {Object.entries(appointmentsByDate || {}).map(([date, appointments]) => (
            <Grid item xs={12} key={date}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {new Date(date).toLocaleDateString('en-AU', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                  <Grid container spacing={2}>
                    {appointments.map((appointment) => (
                      <Grid item xs={12} md={6} key={appointment.id}>
                        <Box
                          sx={{
                            p: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="subtitle1">
                              {appointment.time} - Dr. {appointment.doctor.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={appointment.status}
                              color={getAppointmentStatusColor(appointment.status)}
                            />
                          </Box>
                          <Typography variant="body2">
                            Patient: {appointment.patient.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {appointment.type}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Schedule Appointment */}
      <TabPanel value={tabValue} index={2}>
        <AppointmentScheduler
          mode="clinic"
          doctorId={selectedDoctor}
          onScheduled={handleAppointmentScheduled}
        />
      </TabPanel>
    </Paper>
  );
};

export default ClinicAppointments;
