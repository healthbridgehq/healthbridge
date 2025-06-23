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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { Info, Lock, Security } from '@mui/icons-material';
import { PatientHealthProfile, MyHealthRecordConsent } from '../../types/healthcare';

const steps = [
  'Identity Verification',
  'Personal Information',
  'Medicare Details',
  'My Health Record Setup',
  'Health Profile',
  'Privacy & Consent',
];

interface IdentityVerificationData {
  method: 'medicare' | 'passport' | 'drivers_license';
  documentNumber: string;
  expiryDate?: string;
  givenNames?: string;
  familyName?: string;
  dateOfBirth?: string;
}

export const EnhancedPatientRegistration: React.FC = () => {
  const theme = useTheme();
  const { registerPatient } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  // Form state
  const [identityData, setIdentityData] = useState<IdentityVerificationData>({
    method: 'medicare',
    documentNumber: '',
  });

  const [personalData, setPersonalData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    address: {
      street: '',
      suburb: '',
      state: '',
      postcode: '',
    },
  });

  const [medicareData, setMedicareData] = useState({
    number: '',
    irn: '',
    expiryDate: '',
    nameOnCard: '',
  });

  const [mhrConsent, setMhrConsent] = useState<MyHealthRecordConsent>({
    consentToUpload: false,
    consentToShare: false,
    consentToResearch: false,
    secondaryUseConsent: false,
    thirdPartyAccess: false,
    emergencyAccess: true,
  });

  const [healthProfile, setHealthProfile] = useState({
    allergies: [] as { substance: string; reaction: string; severity: string }[],
    conditions: [] as { condition: string; status: string; diagnosedDate: string }[],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      hasAccessRights: false,
    },
  });

  const [privacyConsent, setPrivacyConsent] = useState({
    termsAccepted: false,
    privacyPolicyAccepted: false,
    dataCollectionConsent: false,
    mhrParticipationConsent: false,
  });

  const handleIdentityVerification = async () => {
    try {
      setIsSubmitting(true);
      // Simulate identity verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Move to next step if verification successful
      handleNext();
    } catch (error) {
      setErrors({
        identity: 'Identity verification failed. Please check your details and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Identity Verification
        if (!identityData.documentNumber) {
          newErrors.documentNumber = 'Document number is required';
        }
        if (identityData.method === 'medicare' && !identityData.expiryDate) {
          newErrors.expiryDate = 'Expiry date is required';
        }
        break;

      case 1: // Personal Information
        if (!personalData.email) newErrors.email = 'Email is required';
        if (!personalData.password) newErrors.password = 'Password is required';
        if (!personalData.firstName) newErrors.firstName = 'First name is required';
        if (!personalData.lastName) newErrors.lastName = 'Last name is required';
        if (!personalData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!personalData.phone) newErrors.phone = 'Phone number is required';
        break;

      case 2: // Medicare Details
        if (!medicareData.number) newErrors.medicareNumber = 'Medicare number is required';
        if (!medicareData.irn) newErrors.irn = 'IRN is required';
        if (!medicareData.expiryDate) newErrors.medicareExpiry = 'Expiry date is required';
        break;

      case 3: // My Health Record Setup
        // No validation required - optional consents
        break;

      case 4: // Health Profile
        if (!healthProfile.emergencyContact.name) {
          newErrors.emergencyContactName = 'Emergency contact name is required';
        }
        if (!healthProfile.emergencyContact.phone) {
          newErrors.emergencyContactPhone = 'Emergency contact phone is required';
        }
        break;

      case 5: // Privacy & Consent
        if (!privacyConsent.termsAccepted) {
          newErrors.terms = 'You must accept the terms and conditions';
        }
        if (!privacyConsent.privacyPolicyAccepted) {
          newErrors.privacy = 'You must accept the privacy policy';
        }
        if (!privacyConsent.dataCollectionConsent) {
          newErrors.dataCollection = 'You must consent to data collection';
        }
        if (!privacyConsent.mhrParticipationConsent) {
          newErrors.mhrParticipation = 'You must consent to My Health Record participation';
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
      
      // Combine all data into final registration payload
      const registrationData: Partial<PatientHealthProfile> = {
        medicareDetails: {
          number: medicareData.number,
          irn: medicareData.irn,
          expiryDate: medicareData.expiryDate,
        },
        myHealthRecord: {
          status: 'active',
          consentSettings: mhrConsent,
          lastUpdated: new Date().toISOString(),
        },
        emergencyContact: healthProfile.emergencyContact,
        clinicalDetails: {
          allergies: healthProfile.allergies,
          conditions: healthProfile.conditions,
          medications: [],
        },
      };

      await registerPatient({
        ...personalData,
        healthProfile: registrationData,
      });

    } catch (error) {
      setErrors({
        submit: 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIdentityVerification = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<Security />}>
          To ensure the security of your health information, we need to verify your identity.
          This process complies with Australian healthcare regulations.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Choose Verification Method</FormLabel>
          <RadioGroup
            value={identityData.method}
            onChange={(e) =>
              setIdentityData({ ...identityData, method: e.target.value as any })
            }
          >
            <FormControlLabel
              value="medicare"
              control={<Radio />}
              label="Medicare Card"
            />
            <FormControlLabel
              value="passport"
              control={<Radio />}
              label="Australian Passport"
            />
            <FormControlLabel
              value="drivers_license"
              control={<Radio />}
              label="Driver's License"
            />
          </RadioGroup>
        </FormControl>
      </Grid>

      {identityData.method === 'medicare' && (
        <>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Medicare Number"
              value={identityData.documentNumber}
              onChange={(e) =>
                setIdentityData({ ...identityData, documentNumber: e.target.value })
              }
              error={!!errors.documentNumber}
              helperText={errors.documentNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Expiry Date"
              value={identityData.expiryDate ? new Date(identityData.expiryDate) : null}
              onChange={(date) =>
                setIdentityData({
                  ...identityData,
                  expiryDate: date ? format(date, 'yyyy-MM-dd') : undefined,
                })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.expiryDate,
                  helperText: errors.expiryDate,
                },
              }}
            />
          </Grid>
        </>
      )}

      {/* Similar fields for passport and driver's license */}
    </Grid>
  );

  const renderMyHealthRecordSetup = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<Lock />}>
          My Health Record is a secure online summary of your health information.
          Healthcare providers can access this information to provide you with better care.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Access Controls
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={mhrConsent.consentToUpload}
              onChange={(e) =>
                setMhrConsent({
                  ...mhrConsent,
                  consentToUpload: e.target.checked,
                })
              }
            />
          }
          label="Allow healthcare providers to upload information to my record"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={mhrConsent.consentToShare}
              onChange={(e) =>
                setMhrConsent({
                  ...mhrConsent,
                  consentToShare: e.target.checked,
                })
              }
            />
          }
          label="Allow healthcare providers to view my record"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Research & Secondary Use
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={mhrConsent.consentToResearch}
              onChange={(e) =>
                setMhrConsent({
                  ...mhrConsent,
                  consentToResearch: e.target.checked,
                })
              }
            />
          }
          label="Allow de-identified data to be used for research purposes"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Emergency Access
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={mhrConsent.emergencyAccess}
              onChange={(e) =>
                setMhrConsent({
                  ...mhrConsent,
                  emergencyAccess: e.target.checked,
                })
              }
            />
          }
          label="Allow emergency access to my record in life-threatening situations"
        />
      </Grid>
    </Grid>
  );

  const renderHealthProfile = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Emergency Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={healthProfile.emergencyContact.name}
              onChange={(e) =>
                setHealthProfile({
                  ...healthProfile,
                  emergencyContact: {
                    ...healthProfile.emergencyContact,
                    name: e.target.value,
                  },
                })
              }
              error={!!errors.emergencyContactName}
              helperText={errors.emergencyContactName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Relationship"
              value={healthProfile.emergencyContact.relationship}
              onChange={(e) =>
                setHealthProfile({
                  ...healthProfile,
                  emergencyContact: {
                    ...healthProfile.emergencyContact,
                    relationship: e.target.value,
                  },
                })
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={healthProfile.emergencyContact.phone}
              onChange={(e) =>
                setHealthProfile({
                  ...healthProfile,
                  emergencyContact: {
                    ...healthProfile.emergencyContact,
                    phone: e.target.value,
                  },
                })
              }
              error={!!errors.emergencyContactPhone}
              helperText={errors.emergencyContactPhone}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={healthProfile.emergencyContact.hasAccessRights}
                  onChange={(e) =>
                    setHealthProfile({
                      ...healthProfile,
                      emergencyContact: {
                        ...healthProfile.emergencyContact,
                        hasAccessRights: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Grant this person access to my health information in emergencies"
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Health Information
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          This information is optional but can help healthcare providers deliver better care.
        </Alert>
        {/* Add fields for allergies and conditions */}
      </Grid>
    </Grid>
  );

  const renderPrivacyAndConsent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<Info />}>
          Please review and accept the following to complete your registration.
          These consents are required by Australian healthcare regulations.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={privacyConsent.termsAccepted}
              onChange={(e) =>
                setPrivacyConsent({
                  ...privacyConsent,
                  termsAccepted: e.target.checked,
                })
              }
            />
          }
          label={
            <Typography variant="body2">
              I accept the{' '}
              <Link href="#" onClick={() => setShowPrivacyDialog(true)}>
                Terms and Conditions
              </Link>
            </Typography>
          }
        />
        {errors.terms && (
          <Typography color="error" variant="caption">
            {errors.terms}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={privacyConsent.privacyPolicyAccepted}
              onChange={(e) =>
                setPrivacyConsent({
                  ...privacyConsent,
                  privacyPolicyAccepted: e.target.checked,
                })
              }
            />
          }
          label={
            <Typography variant="body2">
              I accept the{' '}
              <Link href="#" onClick={() => setShowPrivacyDialog(true)}>
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        {errors.privacy && (
          <Typography color="error" variant="caption">
            {errors.privacy}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={privacyConsent.dataCollectionConsent}
              onChange={(e) =>
                setPrivacyConsent({
                  ...privacyConsent,
                  dataCollectionConsent: e.target.checked,
                })
              }
            />
          }
          label="I consent to the collection and use of my health information as described in the Privacy Policy"
        />
        {errors.dataCollection && (
          <Typography color="error" variant="caption">
            {errors.dataCollection}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={privacyConsent.mhrParticipationConsent}
              onChange={(e) =>
                setPrivacyConsent({
                  ...privacyConsent,
                  mhrParticipationConsent: e.target.checked,
                })
              }
            />
          }
          label={
            <Typography variant="body2">
              I consent to participate in My Health Record and understand how my information
              will be used as described in the{' '}
              <Link href="#" onClick={() => setShowConsentDialog(true)}>
                My Health Record Consent Statement
              </Link>
            </Typography>
          }
        />
        {errors.mhrParticipation && (
          <Typography color="error" variant="caption">
            {errors.mhrParticipation}
          </Typography>
        )}
      </Grid>
    </Grid>
  );

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return renderIdentityVerification();
      case 1:
        return renderPersonalInformation();
      case 2:
        return renderMedicareDetails();
      case 3:
        return renderMyHealthRecordSetup();
      case 4:
        return renderHealthProfile();
      case 5:
        return renderPrivacyAndConsent();
      default:
        return null;
    }
  };

  return (
    <Box maxWidth={800} mx="auto" p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        Patient Registration
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 4 }}>
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

        {renderStep()}

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
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === 0 ? handleIdentityVerification : handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting && activeStep === 0 ? (
                <CircularProgress size={24} />
              ) : (
                'Next'
              )}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Privacy Policy Dialog */}
      <Dialog
        open={showPrivacyDialog}
        onClose={() => setShowPrivacyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogContent>
          {/* Add privacy policy content */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrivacyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Consent Dialog */}
      <Dialog
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>My Health Record Consent Statement</DialogTitle>
        <DialogContent>
          {/* Add MHR consent content */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConsentDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
