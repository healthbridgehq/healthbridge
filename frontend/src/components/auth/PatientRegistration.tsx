import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Grid,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { PatientRegistration as PatientRegistrationType } from '../../types/auth';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

const steps = [
  'Personal Information',
  'Contact Details',
  'Medicare Verification',
  'Review & Confirm',
];

export const PatientRegistration: React.FC = () => {
  const theme = useTheme();
  const { registerPatient } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<PatientRegistrationType>>({
    acceptedTerms: false,
    privacyConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0:
        if (!formData.firstName?.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName?.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
          newErrors.email = 'Invalid email address';
        }
        if (!formData.password?.trim()) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        break;

      case 1:
        if (!formData.phoneNumber?.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        }
        if (!formData.address?.street?.trim()) {
          newErrors.street = 'Street address is required';
        }
        if (!formData.address?.suburb?.trim()) {
          newErrors.suburb = 'Suburb is required';
        }
        if (!formData.address?.state?.trim()) {
          newErrors.state = 'State is required';
        }
        if (!formData.address?.postcode?.trim()) {
          newErrors.postcode = 'Postcode is required';
        }
        break;

      case 2:
        if (!formData.medicareNumber?.trim()) {
          newErrors.medicareNumber = 'Medicare number is required';
        } else if (!/^\d{10}$/.test(formData.medicareNumber)) {
          newErrors.medicareNumber = 'Invalid Medicare number';
        }
        if (!formData.medicareIRN?.trim()) {
          newErrors.medicareIRN = 'IRN is required';
        }
        if (!formData.medicareExpiryDate?.trim()) {
          newErrors.medicareExpiryDate = 'Expiry date is required';
        }
        break;

      case 3:
        if (!formData.acceptedTerms) {
          newErrors.acceptedTerms = 'You must accept the terms and conditions';
        }
        if (!formData.privacyConsent) {
          newErrors.privacyConsent = 'You must consent to the privacy policy';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setIsSubmitting(true);
      await registerPatient(formData as PatientRegistrationType);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Date of Birth"
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                onChange={(date) =>
                  handleChange('dateOfBirth', date ? format(date, 'yyyy-MM-dd') : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                required
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber || ''}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address?.street || ''}
                onChange={(e) =>
                  handleChange('address', {
                    ...formData.address,
                    street: e.target.value,
                  })
                }
                error={!!errors.street}
                helperText={errors.street}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Suburb"
                value={formData.address?.suburb || ''}
                onChange={(e) =>
                  handleChange('address', {
                    ...formData.address,
                    suburb: e.target.value,
                  })
                }
                error={!!errors.suburb}
                helperText={errors.suburb}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.address?.state || ''}
                onChange={(e) =>
                  handleChange('address', {
                    ...formData.address,
                    state: e.target.value,
                  })
                }
                error={!!errors.state}
                helperText={errors.state}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Postcode"
                value={formData.address?.postcode || ''}
                onChange={(e) =>
                  handleChange('address', {
                    ...formData.address,
                    postcode: e.target.value,
                  })
                }
                error={!!errors.postcode}
                helperText={errors.postcode}
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please enter your Medicare card details exactly as they appear on
                your card.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medicare Number"
                value={formData.medicareNumber || ''}
                onChange={(e) => handleChange('medicareNumber', e.target.value)}
                error={!!errors.medicareNumber}
                helperText={errors.medicareNumber}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Individual Reference Number (IRN)"
                value={formData.medicareIRN || ''}
                onChange={(e) => handleChange('medicareIRN', e.target.value)}
                error={!!errors.medicareIRN}
                helperText={errors.medicareIRN}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Medicare Expiry Date"
                value={
                  formData.medicareExpiryDate
                    ? new Date(formData.medicareExpiryDate)
                    : null
                }
                onChange={(date) =>
                  handleChange(
                    'medicareExpiryDate',
                    date ? format(date, 'yyyy-MM-dd') : null
                  )
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.medicareExpiryDate,
                    helperText: errors.medicareExpiryDate,
                  },
                }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Personal Information
                  </Typography>
                  <Typography>
                    {formData.firstName} {formData.lastName}
                    <br />
                    {format(new Date(formData.dateOfBirth!), 'PP')}
                    <br />
                    {formData.email}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Details
                  </Typography>
                  <Typography>
                    {formData.phoneNumber}
                    <br />
                    {formData.address?.street}
                    <br />
                    {formData.address?.suburb}, {formData.address?.state}{' '}
                    {formData.address?.postcode}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Medicare Details
                  </Typography>
                  <Typography>
                    Medicare Number: {formData.medicareNumber}
                    <br />
                    IRN: {formData.medicareIRN}
                    <br />
                    Expires: {format(new Date(formData.medicareExpiryDate!), 'PP')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.acceptedTerms}
                      onChange={(e) =>
                        handleChange('acceptedTerms', e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I accept the{' '}
                      <Link href="/terms" target="_blank">
                        Terms and Conditions
                      </Link>
                    </Typography>
                  }
                />
                {errors.acceptedTerms && (
                  <Typography color="error" variant="caption">
                    {errors.acceptedTerms}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.privacyConsent}
                      onChange={(e) =>
                        handleChange('privacyConsent', e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I consent to the{' '}
                      <Link href="/privacy" target="_blank">
                        Privacy Policy
                      </Link>{' '}
                      and the collection and use of my health information
                    </Typography>
                  }
                />
                {errors.privacyConsent && (
                  <Typography color="error" variant="caption">
                    {errors.privacyConsent}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box maxWidth={800} mx="auto" p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        Patient Registration
      </Typography>
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                'Complete Registration'
              )}
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
