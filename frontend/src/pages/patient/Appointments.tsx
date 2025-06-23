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
  ListItemIcon,
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Event as EventIcon,
  LocalHospital,
  Cancel,
  Edit,
  Add,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  fetchAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  fetchAvailableSlots,
  fetchClinics,
} from '../../services/api/patient';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { Appointment } from '../../types';

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

const Appointments: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string }>>([]);
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery(
    ['appointments', tabValue],
    () => fetchAppointments()
  );

  // Fetch clinics
  const { data: clinicsData, isLoading: clinicsLoading } = useQuery('clinics', fetchClinics, {
    onSuccess: (data) => setClinics(data || [])
  });

  // Fetch available slots
  const { data: availableSlotsData = [], isLoading: slotsLoading } = useQuery(
    ['availableSlots', selectedClinic, selectedDate],
    () => selectedClinic && selectedDate ? fetchAvailableSlots(selectedClinic, selectedDate.toISOString().split('T')[0]) : null,
    { enabled: !!(selectedClinic && selectedDate) }
  );

  // Book appointment mutation
  const bookMutation = useMutation(bookAppointment, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      enqueueSnackbar('Appointment booked successfully', { variant: 'success' });
      handleCloseBookingDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to book appointment', { variant: 'error' });
    },
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation(cancelAppointment, {
    onSuccess: () => {
      queryClient.invalidateQueries('appointments');
      enqueueSnackbar('Appointment cancelled successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to cancel appointment', { variant: 'error' });
    },
  });

  // Reschedule appointment mutation
  const rescheduleMutation = useMutation(
    ({ appointmentId, date, slot }: { appointmentId: string; date: string; slot: string }) =>
      rescheduleAppointment(appointmentId, { date, time: slot })
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenBookingDialog = () => {
    setBookingDialogOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false);
    resetBookingForm();
  };

  const handleOpenRescheduleDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedClinic(appointment.clinic.id);
    setSelectedType(appointment.type);
    setRescheduleDialogOpen(true);
  };

  const handleCloseRescheduleDialog = () => {
    setRescheduleDialogOpen(false);
    resetBookingForm();
  };

  const resetBookingForm = () => {
    setSelectedClinic('');
    setSelectedType('');
    setSelectedDate(null);
    setSelectedSlot('');
    setReason('');
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(date);
  };

  const handleBook = () => {
    if (!selectedClinic || !selectedType || !selectedDate || !selectedSlot) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    bookMutation.mutate({
      clinic: { id: selectedClinic, name: clinics.find(c => c.id === selectedClinic)?.name || '' },
      type: selectedType,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedSlot,
      reason,
    });
  };

  const handleReschedule = () => {
    if (!selectedDate || !selectedSlot) {
      enqueueSnackbar('Please select a new date and time', { variant: 'error' });
      return;
    }

    rescheduleMutation.mutate({
      appointmentId: selectedAppointment.id,
      date: selectedDate.toISOString().split('T')[0],
      slot: selectedSlot,
    });
  };

  const handleCancel = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelMutation.mutate(appointmentId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderAppointmentList = () => (
    <List>
      {appointments?.map((appointment) => (
        <ListItem
          key={appointment.id}
          divider
          secondaryAction={
            tabValue === 0 && (
              <Stack direction="row" spacing={1}>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenRescheduleDialog(appointment)}
                  disabled={appointment.status === 'cancelled'}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleCancel(appointment.id)}
                  disabled={appointment.status === 'cancelled'}
                >
                  <Cancel />
                </IconButton>
              </Stack>
            )
          }
        >
          <ListItemIcon>
            <EventIcon color={appointment.status === 'cancelled' ? 'error' : 'primary'} />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                {appointment.type}
                <Chip
                  size="small"
                  label={appointment.status}
                  color={
                    appointment.status === 'confirmed'
                      ? 'success'
                      : appointment.status === 'cancelled'
                      ? 'error'
                      : 'default'
                  }
                  sx={{ ml: 1 }}
                />
              </>
            }
            secondary={
              <>
                {formatDate(appointment.date)} at {formatTime(appointment.slot)}
                <br />
                {appointment.clinic.name} • Dr. {appointment.doctor.name}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Appointments</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenBookingDialog}
          >
            Book Appointment
          </Button>
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
              {isLoading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                  <CircularProgress />
                </Box>
              ) : appointments?.length ? (
                renderAppointmentList()
              ) : (
                <Box textAlign="center" mt={4}>
                  <Typography color="textSecondary">
                    No {tabValue === 0 ? 'upcoming' : 'past'} appointments
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={handleCloseBookingDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Clinic</InputLabel>
              <Select
                value={selectedClinic}
                label="Clinic"
                onChange={(e) => setSelectedClinic(e.target.value)}
              >
                {clinics?.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                value={selectedType}
                label="Appointment Type"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="checkup">Check-up</MenuItem>
                <MenuItem value="followup">Follow-up</MenuItem>
              </Select>
            </FormControl>

            <DateTimePicker
              label="Date"
              value={selectedDate}
              onChange={setSelectedDate}
              sx={{ mb: 2, width: '100%' }}
              minDate={new Date()}
            />

            {selectedDate && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Available Slots</InputLabel>
                <Select
                  value={selectedSlot}
                  label="Available Slots"
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  {slotsLoading ? (
                    <MenuItem disabled>Loading slots...</MenuItem>
                  ) : availableSlots?.length ? (
                    availableSlots.map((slot) => (
                      <MenuItem key={slot.time} value={slot.time}>
                        {formatTime(slot.time)}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No available slots</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Reason for Visit"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBookingDialog}>Cancel</Button>
          <Button
            onClick={handleBook}
            variant="contained"
            disabled={bookMutation.isLoading}
          >
            {bookMutation.isLoading ? <CircularProgress size={24} /> : 'Book'}
          </Button>
        </DialogActions>
      </Dialog>

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
              Current appointment: {selectedAppointment?.type} on{' '}
              {formatDate(selectedAppointment?.date)} at{' '}
              {formatTime(selectedAppointment?.time || '')}
            </Alert>

            <DateTimePicker
              label="New Date"
              value={selectedDate}
              onChange={setSelectedDate}
              sx={{ mb: 2, width: '100%' }}
              minDate={new Date()}
            />

            {selectedDate && (
              <FormControl fullWidth>
                <InputLabel>Available Slots</InputLabel>
                <Select
                  value={selectedSlot}
                  label="Available Slots"
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  {slotsLoading ? (
                    <MenuItem disabled>Loading slots...</MenuItem>
                  ) : availableSlots?.length ? (
                    availableSlots.map((slot) => (
                      <MenuItem key={slot.time} value={slot.time}>
                        {formatTime(slot.time)}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No available slots</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRescheduleDialog}>Cancel</Button>
          <Button
            onClick={handleReschedule}
            variant="contained"
            disabled={rescheduleMutation.isLoading}
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

export default Appointments;
