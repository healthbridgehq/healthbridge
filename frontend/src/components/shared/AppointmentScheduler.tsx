import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { format, addDays, isSameDay } from 'date-fns';
import { useAppointments } from '../../hooks/useAppointments';
import { colors } from '../../theme/colors';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableDays: string[];
}

interface AppointmentSchedulerProps {
  mode: 'patient' | 'clinic';
  patientId?: string;
  doctorId?: string;
  onScheduled: (appointmentId: string) => void;
  onCancelled?: () => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  mode,
  patientId,
  doctorId,
  onScheduled,
  onCancelled,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = React.useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string>('');
  const [appointmentType, setAppointmentType] = React.useState<string>('');
  const [notes, setNotes] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {
    appointments,
    getDoctorAvailability,
    addAppointment,
    isAddingAppointment,
  } = useAppointments();

  const { data: availability } = getDoctorAvailability(
    selectedDoctor,
    format(selectedDate, 'yyyy-MM-dd')
  );

  // Mock data - replace with actual API data
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      specialty: 'General Practice',
      availableDays: ['Monday', 'Tuesday', 'Wednesday'],
    },
    {
      id: '2',
      name: 'Dr. John Brown',
      specialty: 'Pediatrics',
      availableDays: ['Wednesday', 'Thursday', 'Friday'],
    },
  ];

  const appointmentTypes = [
    'Standard Consultation',
    'Long Consultation',
    'Telehealth',
    'Follow Up',
    'Procedure',
  ];

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTimeSlot('');
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    setSelectedTimeSlot('');
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    setDialogOpen(true);
  };

  const handleSchedule = async () => {
    try {
      const appointmentData = {
        patientId: patientId,
        doctorId: selectedDoctor,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTimeSlot,
        type: appointmentType,
        notes: notes,
      };

      const result = await addAppointment(appointmentData);
      onScheduled(result.id);
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
    }
  };

  const timeSlots: TimeSlot[] = availability?.timeSlots || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper
        elevation={1}
        sx={{
          p: 3,
          bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Schedule Appointment
        </Typography>

        <Grid container spacing={3}>
          {/* Doctor Selection */}
          {mode === 'patient' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctor}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  startAdornment={<DoctorIcon sx={{ mr: 1 }} />}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Date Selection */}
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              disablePast
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <EventIcon sx={{ mr: 1 }} />,
                  }}
                />
              )}
            />
          </Grid>

          {/* Time Slots */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Available Time Slots
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 1,
              }}
            >
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTimeSlot === slot.time ? 'contained' : 'outlined'}
                  disabled={!slot.available}
                  onClick={() => handleTimeSlotSelect(slot.time)}
                  startIcon={<TimeIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {slot.time}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Appointment Details Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSchedule}
              variant="contained"
              disabled={!appointmentType || isAddingAppointment}
            >
              Schedule Appointment
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </LocalizationProvider>
  );
};

export default AppointmentScheduler;
