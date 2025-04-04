import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Event as EventIcon,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  MoreVert,
  Send,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  fetchAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  sendReminder,
  fetchDoctors,
} from '../../api/services/clinicService';
import { formatDate, formatTime } from '../../utils/dateUtils';

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

const AppointmentManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [newDateTime, setNewDateTime] = useState<Date | null>(null);

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery(
    ['appointments', tabValue, selectedDate, selectedStatus, selectedDoctor],
    () => fetchAppointments({
      type: tabValue === 0 ? 'upcoming' : 'past',
      date: selectedDate,
      status: selectedStatus,
      doctorId: selectedDoctor,
    })
  );

  // Fetch doctors
  const { data: doctors } = useQuery('doctors', fetchDoctors);

  // Update status mutation
  const updateStatusMutation = useMutation(updateAppointmentStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      enqueueSnackbar('Appointment status updated', { variant: 'success' });
      handleCloseMenu();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update status', { variant: 'error' });
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation(rescheduleAppointment, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      enqueueSnackbar('Appointment rescheduled successfully', { variant: 'success' });
      handleCloseRescheduleDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to reschedule appointment', { variant: 'error' });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation(cancelAppointment, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      enqueueSnackbar('Appointment cancelled successfully', { variant: 'success' });
      handleCloseMenu();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to cancel appointment', { variant: 'error' });
    },
  });

  // Send reminder mutation
  const reminderMutation = useMutation(sendReminder, {
    onSuccess: () => {
      enqueueSnackbar('Reminder sent successfully', { variant: 'success' });
      handleCloseMenu();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to send reminder', { variant: 'error' });
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, appointment: any) => {
    setSelectedAppointment(appointment);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleOpenRescheduleDialog = () => {
    setRescheduleDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseRescheduleDialog = () => {
    setRescheduleDialogOpen(false);
    setNewDateTime(null);
  };

  const handleUpdateStatus = (status: string) => {
    if (selectedAppointment) {
      updateStatusMutation.mutate({
        appointmentId: selectedAppointment.id,
        status,
      });
    }
  };

  const handleReschedule = () => {
    if (selectedAppointment && newDateTime) {
      rescheduleMutation.mutate({
        appointmentId: selectedAppointment.id,
        newDateTime,
      });
    }
  };

  const handleCancel = () => {
    if (selectedAppointment && window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelMutation.mutate(selectedAppointment.id);
    }
  };

  const handleSendReminder = () => {
    if (selectedAppointment) {
      reminderMutation.mutate(selectedAppointment.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const filteredAppointments = appointments?.filter(appointment =>
    appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Appointment Management</Typography>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Upcoming" />
                <Tab label="Past" />
              </Tabs>
            </Box>

            <CardContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <DateTimePicker
                    label="Filter by Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                      value={selectedDoctor}
                      label="Doctor"
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                      <MenuItem value="all">All Doctors</MenuItem>
                      {doctors?.map((doctor) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : filteredAppointments?.length ? (
                <List>
                  {filteredAppointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={(e) => handleOpenMenu(e, appointment)}
                        >
                          <MoreVert />
                        </IconButton>
                      }
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <EventIcon color="primary" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <ListItemText
                            primary={appointment.patient.name}
                            secondary={`Patient ID: ${appointment.patient.id}`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <ListItemText
                            primary={`Dr. ${appointment.doctor.name}`}
                            secondary={appointment.type}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <ListItemText
                            primary={formatDate(appointment.date)}
                            secondary={formatTime(appointment.time)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No appointments found</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleUpdateStatus('confirmed')}>
          <ListItemText>Confirm Appointment</ListItemText>
          <CheckCircle fontSize="small" color="success" />
        </MenuItem>
        <MenuItem onClick={handleOpenRescheduleDialog}>
          <ListItemText>Reschedule</ListItemText>
          <Edit fontSize="small" />
        </MenuItem>
        <MenuItem onClick={handleCancel}>
          <ListItemText>Cancel</ListItemText>
          <Cancel fontSize="small" color="error" />
        </MenuItem>
        <MenuItem onClick={handleSendReminder}>
          <ListItemText>Send Reminder</ListItemText>
          <Send fontSize="small" />
        </MenuItem>
      </Menu>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onClose={handleCloseRescheduleDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Current appointment: {selectedAppointment?.type} with{' '}
              {selectedAppointment?.patient.name} on{' '}
              {formatDate(selectedAppointment?.date)} at{' '}
              {formatTime(selectedAppointment?.time)}
            </Alert>

            <DateTimePicker
              label="New Date & Time"
              value={newDateTime}
              onChange={setNewDateTime}
              sx={{ width: '100%' }}
              minDate={new Date()}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRescheduleDialog}>Cancel</Button>
          <Button
            onClick={handleReschedule}
            variant="contained"
            disabled={!newDateTime || rescheduleMutation.isLoading}
          >
            {rescheduleMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Reschedule'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentManagement;
