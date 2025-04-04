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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Avatar,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  specialties: string[];
  ahpraNumber?: string;
  providerNumber?: string;
  verificationStatus: {
    ahpra: boolean;
    identity: boolean;
    qualifications: boolean;
  };
}

interface StaffManagementProps {
  staffMembers: StaffMember[];
  onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (id: string, updates: Partial<StaffMember>) => void;
  onDeleteStaff: (id: string) => void;
  onVerifyStaff: (id: string) => void;
}

const roles = [
  'Doctor',
  'Nurse',
  'Receptionist',
  'Practice Manager',
  'Allied Health',
  'Administrator',
];

const specialties = [
  'General Practice',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Neurology',
  'Orthopedics',
  'Psychiatry',
  'Radiology',
];

const StaffManagement: React.FC<StaffManagementProps> = ({
  staffMembers,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onVerifyStaff,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    ahpraNumber: '',
    providerNumber: '',
  });

  const handleOpenDialog = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
        email: staff.email,
        phone: staff.phone,
        specialties: staff.specialties,
        ahpraNumber: staff.ahpraNumber || '',
        providerNumber: staff.providerNumber || '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: '',
        lastName: '',
        role: '',
        email: '',
        phone: '',
        specialties: [],
        ahpraNumber: '',
        providerNumber: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
  };

  const handleSubmit = () => {
    if (editingStaff) {
      onUpdateStaff(editingStaff.id, formData);
    } else {
      onAddStaff({
        ...formData,
        status: 'pending',
        verificationStatus: {
          ahpra: false,
          identity: false,
          qualifications: false,
        },
      });
    }
    handleCloseDialog();
  };

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

  const needsVerification = (staff: StaffMember) => {
    return !Object.values(staff.verificationStatus).every(status => status);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Staff Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Staff Member
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Member</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verification</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffMembers.map((staff) => (
              <TableRow key={staff.id}>
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
                      {staff.firstName[0]}
                      {staff.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {staff.firstName} {staff.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {staff.specialties.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell>
                  <Typography variant="body2">{staff.email}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {staff.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={staff.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(staff.status),
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>
                  {needsVerification(staff) ? (
                    <Tooltip title="Verification Required">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => onVerifyStaff(staff.id)}
                      >
                        <WarningIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Fully Verified">
                      <IconButton size="small" color="success">
                        <VerifiedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(staff)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteStaff(staff.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
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
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Specialties</InputLabel>
                <Select
                  multiple
                  value={formData.specialties}
                  label="Specialties"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialties: e.target.value as string[],
                    })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
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
            {formData.role === 'Doctor' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="AHPRA Number"
                    value={formData.ahpraNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, ahpraNumber: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Provider Number"
                    value={formData.providerNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, providerNumber: e.target.value })
                    }
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.firstName || !formData.lastName || !formData.role}
          >
            {editingStaff ? 'Save Changes' : 'Add Staff Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagement;
