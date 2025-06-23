import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { colors } from '../../theme/colors';

interface ProviderIdentityFormProps {
  initialData?: {
    firstName: string;
    lastName: string;
    ahpraNumber: string;
    providerNumber: string;
    subspecialties: string[];
    qualifications: Array<{
      degree: string;
      institution: string;
      year: number;
    }>;
    clinicAffiliations: Array<{
      clinicId: string;
      clinicName: string;
      role: string;
      startDate: string;
    }>;
    insurance: {
      provider: string;
      policyNumber: string;
      expiryDate: string;
    };
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// Predefined lists
const subspecialtyOptions = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Geriatrics',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Pediatrics',
  'Psychiatry',
  'Rheumatology',
  'Surgery',
];

const degreeOptions = [
  'MBBS',
  'MD',
  'FRACGP',
  'FRACP',
  'FRACS',
  'PhD',
  'MPH',
  'DCH',
];

const providerRoles = [
  'Primary Care Physician',
  'Specialist',
  'Consultant',
  'Visiting Medical Officer',
  'Resident Medical Officer',
];

const insuranceProviders = [
  'Avant',
  'MIGA',
  'MDA National',
  'MIPS',
  'Guild Insurance',
];

const ProviderIdentityForm: React.FC<ProviderIdentityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [qualificationDialogOpen, setQualificationDialogOpen] = React.useState(false);
  const [editingQualification, setEditingQualification] = React.useState<any>(null);
  const [affiliationDialogOpen, setAffiliationDialogOpen] = React.useState(false);
  const [editingAffiliation, setEditingAffiliation] = React.useState<any>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      ahpraNumber: initialData?.ahpraNumber || '',
      providerNumber: initialData?.providerNumber || '',
      subspecialties: initialData?.subspecialties || [],
      qualifications: initialData?.qualifications || [],
      clinicAffiliations: initialData?.clinicAffiliations || [],
      insurance: initialData?.insurance || {
        provider: '',
        policyNumber: '',
        expiryDate: '',
      },
    },
  });

  const handleAddQualification = (qualification: any) => {
    const currentQualifications = watch('qualifications');
    setValue('qualifications', [...currentQualifications, qualification]);
    setQualificationDialogOpen(false);
    setEditingQualification(null);
  };

  const handleEditQualification = (index: number) => {
    setEditingQualification({ ...watch('qualifications')[index], index });
    setQualificationDialogOpen(true);
  };

  const handleUpdateQualification = (qualification: any) => {
    const currentQualifications = watch('qualifications');
    const updatedQualifications = [...currentQualifications];
    updatedQualifications[editingQualification.index] = qualification;
    setValue('qualifications', updatedQualifications);
    setQualificationDialogOpen(false);
    setEditingQualification(null);
  };

  const handleDeleteQualification = (index: number) => {
    const currentQualifications = watch('qualifications');
    setValue(
      'qualifications',
      currentQualifications.filter((_, i) => i !== index)
    );
  };

  const handleAddAffiliation = (affiliation: any) => {
    const currentAffiliations = watch('clinicAffiliations');
    setValue('clinicAffiliations', [...currentAffiliations, affiliation]);
    setAffiliationDialogOpen(false);
    setEditingAffiliation(null);
  };

  const handleEditAffiliation = (index: number) => {
    setEditingAffiliation({ ...watch('clinicAffiliations')[index], index });
    setAffiliationDialogOpen(true);
  };

  const handleUpdateAffiliation = (affiliation: any) => {
    const currentAffiliations = watch('clinicAffiliations');
    const updatedAffiliations = [...currentAffiliations];
    updatedAffiliations[editingAffiliation.index] = affiliation;
    setValue('clinicAffiliations', updatedAffiliations);
    setAffiliationDialogOpen(false);
    setEditingAffiliation(null);
  };

  const handleDeleteAffiliation = (index: number) => {
    const currentAffiliations = watch('clinicAffiliations');
    setValue(
      'clinicAffiliations',
      currentAffiliations.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card
        elevation={1}
        sx={{
          backgroundColor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
          borderRadius: 2,
        }}
      >
        <CardHeader title="Provider Identity Details" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please ensure all professional registration details are accurate. They will be
                verified with AHPRA and Medicare.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            {/* Registration Numbers */}
            <Grid item xs={12} md={6}>
              <Controller
                name="ahpraNumber"
                control={control}
                rules={{
                  required: 'AHPRA number is required',
                  pattern: {
                    value: /^MED\d{7}$/,
                    message: 'Invalid AHPRA number format',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="AHPRA Registration Number"
                    fullWidth
                    error={!!errors.ahpraNumber}
                    helperText={errors.ahpraNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="providerNumber"
                control={control}
                rules={{
                  required: 'Provider number is required',
                  pattern: {
                    value: /^\d{6}[A-Z][A-Z\d]$/,
                    message: 'Invalid provider number format',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Medicare Provider Number"
                    fullWidth
                    error={!!errors.providerNumber}
                    helperText={errors.providerNumber?.message}
                  />
                )}
              />
            </Grid>

            {/* Subspecialties */}
            <Grid item xs={12}>
              <Controller
                name="subspecialties"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={subspecialtyOptions}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subspecialties"
                        error={!!errors.subspecialties}
                        helperText={errors.subspecialties?.message}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option}
                          label={option}
                          color="primary"
                        />
                      ))
                    }
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            {/* Qualifications */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <InputLabel>Qualifications</InputLabel>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setQualificationDialogOpen(true)}
                >
                  Add Qualification
                </Button>
              </Box>
              <List>
                {watch('qualifications').map((qual: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={qual.degree}
                      secondary={`${qual.institution}, ${qual.year}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditQualification(index)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteQualification(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Clinic Affiliations */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <InputLabel>Clinic Affiliations</InputLabel>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setAffiliationDialogOpen(true)}
                >
                  Add Affiliation
                </Button>
              </Box>
              <List>
                {watch('clinicAffiliations').map((affiliation: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={affiliation.clinicName}
                      secondary={`${affiliation.role} - Since ${affiliation.startDate}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditAffiliation(index)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteAffiliation(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Insurance */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <InputLabel sx={{ mb: 2 }}>Professional Indemnity Insurance</InputLabel>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="insurance.provider"
                    control={control}
                    rules={{ required: 'Insurance provider is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Insurance Provider"
                        fullWidth
                        error={!!errors.insurance?.provider}
                        helperText={errors.insurance?.provider?.message}
                      >
                        {insuranceProviders.map((provider) => (
                          <MenuItem key={provider} value={provider}>
                            {provider}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="insurance.policyNumber"
                    control={control}
                    rules={{ required: 'Policy number is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Policy Number"
                        fullWidth
                        error={!!errors.insurance?.policyNumber}
                        helperText={errors.insurance?.policyNumber?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="insurance.expiryDate"
                    control={control}
                    rules={{ required: 'Expiry date is required' }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Expiry Date"
                        format="dd/MM/yyyy"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.insurance?.expiryDate,
                            helperText: errors.insurance?.expiryDate?.message,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 2 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </Box>
      </Card>

      {/* Qualification Dialog */}
      <Dialog
        open={qualificationDialogOpen}
        onClose={() => {
          setQualificationDialogOpen(false);
          setEditingQualification(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingQualification ? 'Edit Qualification' : 'Add Qualification'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Degree"
                fullWidth
                value={editingQualification?.degree || ''}
                onChange={(e) =>
                  setEditingQualification({
                    ...editingQualification || {},
                    degree: e.target.value,
                  })
                }
              >
                {degreeOptions.map((degree) => (
                  <MenuItem key={degree} value={degree}>
                    {degree}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Institution"
                fullWidth
                value={editingQualification?.institution || ''}
                onChange={(e) =>
                  setEditingQualification({
                    ...editingQualification || {},
                    institution: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Year"
                type="number"
                fullWidth
                value={editingQualification?.year || ''}
                onChange={(e) =>
                  setEditingQualification({
                    ...editingQualification || {},
                    year: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setQualificationDialogOpen(false);
              setEditingQualification(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              editingQualification?.index !== undefined
                ? handleUpdateQualification(editingQualification)
                : handleAddQualification(editingQualification)
            }
            variant="contained"
            color="primary"
            disabled={
              !editingQualification?.degree ||
              !editingQualification?.institution ||
              !editingQualification?.year
            }
          >
            {editingQualification?.index !== undefined ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Affiliation Dialog */}
      <Dialog
        open={affiliationDialogOpen}
        onClose={() => {
          setAffiliationDialogOpen(false);
          setEditingAffiliation(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAffiliation ? 'Edit Affiliation' : 'Add Affiliation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Clinic Name"
                fullWidth
                value={editingAffiliation?.clinicName || ''}
                onChange={(e) =>
                  setEditingAffiliation({
                    ...editingAffiliation || {},
                    clinicName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Role"
                fullWidth
                value={editingAffiliation?.role || ''}
                onChange={(e) =>
                  setEditingAffiliation({
                    ...editingAffiliation || {},
                    role: e.target.value,
                  })
                }
              >
                {providerRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Start Date"
                value={editingAffiliation?.startDate || null}
                onChange={(date) =>
                  setEditingAffiliation({
                    ...editingAffiliation || {},
                    startDate: date,
                  })
                }
                format="dd/MM/yyyy"
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAffiliationDialogOpen(false);
              setEditingAffiliation(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              editingAffiliation?.index !== undefined
                ? handleUpdateAffiliation(editingAffiliation)
                : handleAddAffiliation(editingAffiliation)
            }
            variant="contained"
            color="primary"
            disabled={
              !editingAffiliation?.clinicName ||
              !editingAffiliation?.role ||
              !editingAffiliation?.startDate
            }
          >
            {editingAffiliation?.index !== undefined ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default ProviderIdentityForm;
