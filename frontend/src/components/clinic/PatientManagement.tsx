import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { colors } from '../../theme/colors';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  medicare: string;
  ihi: string;
  status: 'active' | 'inactive' | 'pending';
  lastVisit: string;
  upcomingAppointment?: string;
  medicalConditions: string[];
  assignedDoctor: string;
}

interface PatientManagementProps {
  patients: Patient[];
  doctors: Array<{ id: string; name: string }>;
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  onDeletePatient: (id: string) => void;
  onScheduleAppointment: (patientId: string) => void;
  onViewMedicalRecord: (patientId: string) => void;
  onSendMessage: (patientId: string) => void;
}

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

const PatientManagement: React.FC<PatientManagementProps> = ({
  patients,
  doctors,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onScheduleAppointment,
  onViewMedicalRecord,
  onSendMessage,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState<{
    element: HTMLElement;
    patientId: string;
  } | null>(null);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    medicare: '',
    ihi: '',
    medicalConditions: [] as string[],
    assignedDoctor: '',
  });

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        email: patient.email,
        phone: patient.phone,
        medicare: patient.medicare,
        ihi: patient.ihi,
        medicalConditions: patient.medicalConditions,
        assignedDoctor: patient.assignedDoctor,
      });
    } else {
      setEditingPatient(null);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        medicare: '',
        ihi: '',
        medicalConditions: [],
        assignedDoctor: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = () => {
    if (editingPatient) {
      onUpdatePatient(editingPatient.id, formData);
    } else {
      onAddPatient({
        ...formData,
        status: 'pending',
        lastVisit: '',
      });
    }
    handleCloseDialog();
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medicare.includes(searchTerm) ||
      patient.ihi.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.error.main;
      case 'pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Patient Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Patient
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          startIcon={<FilterIcon />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
        >
          Filter
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setStatusFilter('all');
              setFilterAnchorEl(null);
            }}
          >
            All Patients
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter('active');
              setFilterAnchorEl(null);
            }}
          >
            Active Patients
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter('inactive');
              setFilterAnchorEl(null);
            }}
          >
            Inactive Patients
          </MenuItem>
          <MenuItem
            onClick={() => {
              setStatusFilter('pending');
              setFilterAnchorEl(null);
            }}
          >
            Pending Verification
          </MenuItem>
        </Menu>
      </Box>

      {/* Patient List */}
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Healthcare IDs</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        mr: 1,
                      }}
                    >
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {patient.firstName} {patient.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')} ({patient.gender})
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{patient.email}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {patient.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Medicare: {patient.medicare}</Typography>
                  <Typography variant="body2">IHI: {patient.ihi}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {patient.lastVisit
                      ? format(new Date(patient.lastVisit), 'dd/MM/yyyy')
                      : 'No visits'}
                  </Typography>
                  {patient.upcomingAppointment && (
                    <Typography variant="body2" color="primary">
                      Next: {format(new Date(patient.upcomingAppointment), 'dd/MM/yyyy')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={patient.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(patient.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Medical Record">
                      <IconButton
                        size="small"
                        onClick={() => onViewMedicalRecord(patient.id)}
                      >
                        <AssignmentIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Schedule Appointment">
                      <IconButton
                        size="small"
                        onClick={() => onScheduleAppointment(patient.id)}
                      >
                        <CalendarIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) =>
                        setActionMenuAnchorEl({
                          element: e.currentTarget,
                          patientId: patient.id,
                        })
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl?.element}
        open={Boolean(actionMenuAnchorEl)}
        onClose={() => setActionMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (actionMenuAnchorEl) {
              const patient = patients.find(
                (p) => p.id === actionMenuAnchorEl.patientId
              );
              if (patient) {
                handleOpenDialog(patient);
              }
            }
            setActionMenuAnchorEl(null);
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuAnchorEl) {
              onSendMessage(actionMenuAnchorEl.patientId);
            }
            setActionMenuAnchorEl(null);
          }}
        >
          <MessageIcon sx={{ mr: 1 }} /> Send Message
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuAnchorEl) {
              onDeletePatient(actionMenuAnchorEl.patientId);
            }
            setActionMenuAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Remove Patient
        </MenuItem>
      </Menu>

      {/* Add/Edit Patient Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPatient ? 'Edit Patient Details' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medicare Number"
                value={formData.medicare}
                onChange={(e) =>
                  setFormData({ ...formData, medicare: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IHI Number"
                value={formData.ihi}
                onChange={(e) =>
                  setFormData({ ...formData, ihi: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assigned Doctor</InputLabel>
                <Select
                  value={formData.assignedDoctor}
                  label="Assigned Doctor"
                  onChange={(e) =>
                    setFormData({ ...formData, assignedDoctor: e.target.value })
                  }
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.dateOfBirth ||
              !formData.gender
            }
          >
            {editingPatient ? 'Save Changes' : 'Add Patient'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientManagement;
