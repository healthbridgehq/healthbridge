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
  FormControlLabel,
  Switch,
  MenuItem,
  FormHelperText,
  Alert,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parse } from 'date-fns';
import { colors } from '../../theme/colors';
import { usePatientIdentity } from '../../hooks/usePatientIdentity';

interface PatientIdentityFormProps {
  initialData?: {
    ihi: string;
    medicareNumber: string;
    medicareIRN: string;
    medicareExpiryDate: string;
    personalDetails: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
      indigenousStatus?: string;
      culturalBackground?: string;
      preferredLanguage: string;
      interpreterRequired: boolean;
    };
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const indigenousStatusOptions = [
  { value: 'aboriginal', label: 'Aboriginal' },
  { value: 'torres_strait_islander', label: 'Torres Strait Islander' },
  { value: 'both', label: 'Aboriginal and Torres Strait Islander' },
  { value: 'neither', label: 'Neither' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const PatientIdentityForm: React.FC<PatientIdentityFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { verifyIHI, verifyMedicare } = usePatientIdentity();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      ihi: initialData?.ihi || '',
      medicareNumber: initialData?.medicareNumber || '',
      medicareIRN: initialData?.medicareIRN || '',
      medicareExpiryDate: initialData?.medicareExpiryDate || '',
      firstName: initialData?.personalDetails.firstName || '',
      lastName: initialData?.personalDetails.lastName || '',
      dateOfBirth: initialData?.personalDetails.dateOfBirth || '',
      gender: initialData?.personalDetails.gender || '',
      indigenousStatus: initialData?.personalDetails.indigenousStatus || '',
      culturalBackground: initialData?.personalDetails.culturalBackground || '',
      preferredLanguage: initialData?.personalDetails.preferredLanguage || '',
      interpreterRequired: initialData?.personalDetails.interpreterRequired || false,
    },
  });

  const handleVerifyIHI = async (ihi: string) => {
    try {
      const isValid = await verifyIHI(ihi);
      if (!isValid) {
        setError('ihi', {
          type: 'manual',
          message: 'Invalid IHI number',
        });
      } else {
        clearErrors('ihi');
      }
    } catch (error) {
      setError('ihi', {
        type: 'manual',
        message: 'Error verifying IHI',
      });
    }
  };

  const handleVerifyMedicare = async (number: string, irn: string, expiry: string) => {
    try {
      const isValid = await verifyMedicare({
        number,
        irn,
        expiryDate: expiry,
      });
      if (!isValid) {
        setError('medicareNumber', {
          type: 'manual',
          message: 'Invalid Medicare details',
        });
      } else {
        clearErrors('medicareNumber');
      }
    } catch (error) {
      setError('medicareNumber', {
        type: 'manual',
        message: 'Error verifying Medicare details',
      });
    }
  };

  const watchIHI = watch('ihi');
  const watchMedicare = {
    number: watch('medicareNumber'),
    irn: watch('medicareIRN'),
    expiry: watch('medicareExpiryDate'),
  };

  React.useEffect(() => {
    if (watchIHI.length === 16) {
      handleVerifyIHI(watchIHI);
    }
  }, [watchIHI]);

  React.useEffect(() => {
    if (
      watchMedicare.number.length === 10 &&
      watchMedicare.irn.length === 1 &&
      watchMedicare.expiry
    ) {
      handleVerifyMedicare(
        watchMedicare.number,
        watchMedicare.irn,
        watchMedicare.expiry
      );
    }
  }, [watchMedicare.number, watchMedicare.irn, watchMedicare.expiry]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card
        elevation={1}
        sx={{
          backgroundColor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
          borderRadius: 2,
        }}
      >
        <CardHeader title="Patient Identity Details" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Healthcare Identifiers */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please ensure all healthcare identifiers are accurate. They will be verified
                with the appropriate authorities.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="ihi"
                control={control}
                rules={{
                  required: 'IHI is required',
                  pattern: {
                    value: /^\d{16}$/,
                    message: 'IHI must be 16 digits',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Individual Healthcare Identifier (IHI)"
                    fullWidth
                    error={!!errors.ihi}
                    helperText={errors.ihi?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="medicareNumber"
                control={control}
                rules={{
                  required: 'Medicare number is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Medicare number must be 10 digits',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Medicare Number"
                    fullWidth
                    error={!!errors.medicareNumber}
                    helperText={errors.medicareNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="medicareIRN"
                control={control}
                rules={{
                  required: 'IRN is required',
                  pattern: {
                    value: /^\d{1}$/,
                    message: 'IRN must be 1 digit',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Medicare IRN"
                    fullWidth
                    error={!!errors.medicareIRN}
                    helperText={errors.medicareIRN?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="medicareExpiryDate"
                control={control}
                rules={{ required: 'Expiry date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Medicare Expiry Date"
                    views={['month', 'year']}
                    format="MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.medicareExpiryDate,
                        helperText: errors.medicareExpiryDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Personal Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
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
            <Grid item xs={12} md={6}>
              <Controller
                name="dateOfBirth"
                control={control}
                rules={{ required: 'Date of birth is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Date of Birth"
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'Gender is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Gender"
                    fullWidth
                    error={!!errors.gender}
                    helperText={errors.gender?.message}
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="indigenousStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Indigenous Status"
                    fullWidth
                    error={!!errors.indigenousStatus}
                    helperText={errors.indigenousStatus?.message}
                  >
                    {indigenousStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="culturalBackground"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cultural Background"
                    fullWidth
                    error={!!errors.culturalBackground}
                    helperText={errors.culturalBackground?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="preferredLanguage"
                control={control}
                rules={{ required: 'Preferred language is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preferred Language"
                    fullWidth
                    error={!!errors.preferredLanguage}
                    helperText={errors.preferredLanguage?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="interpreterRequired"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Interpreter Required"
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 2 }}>
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </Box>
      </Card>
    </form>
  );
};

export default PatientIdentityForm;
