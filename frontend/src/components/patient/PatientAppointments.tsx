import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import {
  Event as EventIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import AppointmentScheduler from '../shared/AppointmentScheduler';
import { usePatientData } from '../../hooks/usePatientData';
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

const PatientAppointments: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = React.useState(0);
  const { patientData } = usePatientData();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAppointmentScheduled = (appointmentId: string) => {
    // Refresh patient data to show new appointment
    // This will be handled by the usePatientData hook's cache invalidation
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
            icon={<EventIcon />}
            label="Schedule Appointment"
            iconPosition="start"
          />
          <Tab
            icon={<HistoryIcon />}
            label="Appointment History"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AppointmentScheduler
          mode="patient"
          patientId={patientData?.profile.id}
          onScheduled={handleAppointmentScheduled}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={2}>
          {patientData?.appointments.map((appointment) => (
            <Grid item xs={12} key={appointment.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle1">
                  {appointment.type} with {appointment.doctor.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(appointment.date).toLocaleDateString()} at{' '}
                  {appointment.time}
                </Typography>
                {appointment.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Notes: {appointment.notes}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Paper>
  );
};

export default PatientAppointments;
