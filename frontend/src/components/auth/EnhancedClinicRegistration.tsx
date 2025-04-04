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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { Business, Security, VerifiedUser } from '@mui/icons-material';
import { HealthcareOrganisation } from '../../types/healthcare';

const steps = [
  'Organisation Details',
  'Accreditation & Compliance',
  'Healthcare Identifiers',
  'Clinical Systems',
  'Staff & Access',
  'My Health Record Setup',
  'Review & Submit',
];

export const EnhancedClinicRegistration: React.FC = () => {
  const theme = useTheme();
  const { registerClinic } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);

  // Form state
  const [organisationDetails, setOrganisationDetails] = useState({
    legalName: '',
    tradingName: '',
    abn: '',
    type: '',
    serviceTypes: [] as string[],
    primaryLocation: {
      street: '',
      suburb: '',
      state: '',
      postcode: '',
      phone: '',
      fax: '',
      email: '',
    },
    primaryContact: {
      name: '',
      position: '',
      phone: '',
      email: '',
    },
  });

  const [accreditation, setAccreditation] = useState({
    accreditationNumber: '',
    accreditationType: '',
    issueDate: '',
    expiryDate: '',
    hasQualityAssurance: false,
    hasClinicalGovernance: false,
    hasPrivacyPolicy: false,
    hasDataBreachPlan: false,
  });

  const [identifiers, setIdentifiers] = useState({
    hpio: '', // Healthcare Provider Identifier - Organisation
    providerNumbers: [] as string[],
    medicareProviderNumber: '',
  });

  const [clinicalSystems, setClinicalSystems] = useState({
    primarySystem: '',
    version: '',
    mhrCompatible: false,
    secureMessaging: false,
    pathologyIntegration: false,
    imagingIntegration: false,
    prescriptionSystem: '',
  });

  const [staffAccess, setStaffAccess] = useState({
    responsibleOfficer: {
      name: '',
      position: '',
      phone: '',
      email: '',
      hpiI: '', // Healthcare Provider Identifier - Individual
    },
    organisationMaintainer: {
      name: '',
      position: '',
      phone: '',
      email: '',
    },
    staffMembers: [] as {
      name: string;
      role: string;
      hpiI: string;
      accessLevel: string;
    }[],
  });

  const [mhrSetup, setMhrSetup] = useState({
    participationAgreement: false,
    securityPolicy: false,
    staffTraining: false,
    dataQualityProcedures: false,
    incidentManagement: false,
    accessControls: {
      uploadEnabled: false,
      viewEnabled: false,
      prescribeEnabled: false,
      dispenseEnabled: false,
    },
  });

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0: // Organisation Details
        if (!organisationDetails.legalName) {
          newErrors.legalName = 'Legal name is required';
        }
        if (!organisationDetails.abn) {
          newErrors.abn = 'ABN is required';
        }
        if (!organisationDetails.type) {
          newErrors.type = 'Organisation type is required';
        }
        if (!organisationDetails.primaryLocation.street) {
          newErrors.street = 'Street address is required';
        }
        // Add more validation as needed
        break;

      case 1: // Accreditation & Compliance
        if (!accreditation.accreditationNumber) {
          newErrors.accreditationNumber = 'Accreditation number is required';
        }
        if (!accreditation.accreditationType) {
          newErrors.accreditationType = 'Accreditation type is required';
        }
        break;

      case 2: // Healthcare Identifiers
        if (!identifiers.hpio) {
          newErrors.hpio = 'HPI-O is required';
        }
        if (!identifiers.medicareProviderNumber) {
          newErrors.medicareProviderNumber = 'Medicare provider number is required';
        }
        break;

      case 3: // Clinical Systems
        if (!clinicalSystems.primarySystem) {
          newErrors.primarySystem = 'Primary clinical system is required';
        }
        break;

      case 4: // Staff & Access
        if (!staffAccess.responsibleOfficer.name) {
          newErrors.responsibleOfficer = 'Responsible officer details are required';
        }
        if (!staffAccess.responsibleOfficer.hpiI) {
          newErrors.responsibleOfficerHPII = 'Responsible officer HPI-I is required';
        }
        break;

      case 5: // My Health Record Setup
        if (!mhrSetup.participationAgreement) {
          newErrors.participationAgreement = 'Participation agreement acceptance is required';
        }
        if (!mhrSetup.securityPolicy) {
          newErrors.securityPolicy = 'Security policy confirmation is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setIsSubmitting(true);

      const registrationData: Partial<HealthcareOrganisation> = {
        legalName: organisationDetails.legalName,
        tradingName: organisationDetails.tradingName,
        abn: organisationDetails.abn,
        type: organisationDetails.type as any,
        serviceTypes: organisationDetails.serviceTypes,
        hpio: identifiers.hpio,
        accreditations: [{
          type: accreditation.accreditationType,
          number: accreditation.accreditationNumber,
          issueDate: accreditation.issueDate,
          expiryDate: accreditation.expiryDate,
          status: 'active',
        }],
        mhrParticipation: {
          status: 'active',
          level: 'full',
          lastVerified: new Date().toISOString(),
          securityPolicyLastReviewed: new Date().toISOString(),
          authorizedUsers: staffAccess.staffMembers.map(staff => ({
            hpiI: staff.hpiI,
            role: staff.role,
            accessLevel: staff.accessLevel,
          })),
        },
        locations: [{
          type: 'primary',
          address: organisationDetails.primaryLocation,
          phone: organisationDetails.primaryLocation.phone,
          fax: organisationDetails.primaryLocation.fax,
          email: organisationDetails.primaryLocation.email,
        }],
        contacts: [{
          type: 'primary',
          ...organisationDetails.primaryContact,
        }],
        compliance: {
          privacyPolicy: accreditation.hasPrivacyPolicy,
          dataBreachPlan: accreditation.hasDataBreachPlan,
          securityPolicy: mhrSetup.securityPolicy,
          certifications: [],
        },
      };

      await registerClinic(registrationData);

    } catch (error) {
      setErrors({
        submit: 'Registration failed. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOrganisationDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<Business />}>
          Please provide your healthcare organization's official details as registered
          with relevant Australian healthcare authorities.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Legal Name"
          value={organisationDetails.legalName}
          onChange={(e) =>
            setOrganisationDetails({
              ...organisationDetails,
              legalName: e.target.value,
            })
          }
          error={!!errors.legalName}
          helperText={errors.legalName}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Trading Name (if different)"
          value={organisationDetails.tradingName}
          onChange={(e) =>
            setOrganisationDetails({
              ...organisationDetails,
              tradingName: e.target.value,
            })
          }
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="ABN"
          value={organisationDetails.abn}
          onChange={(e) =>
            setOrganisationDetails({
              ...organisationDetails,
              abn: e.target.value,
            })
          }
          error={!!errors.abn}
          helperText={errors.abn}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.type}>
          <InputLabel>Organisation Type</InputLabel>
          <Select
            value={organisationDetails.type}
            onChange={(e) =>
              setOrganisationDetails({
                ...organisationDetails,
                type: e.target.value,
              })
            }
          >
            <MenuItem value="hospital">Hospital</MenuItem>
            <MenuItem value="clinic">Medical Clinic</MenuItem>
            <MenuItem value="pharmacy">Pharmacy</MenuItem>
            <MenuItem value="pathology">Pathology Service</MenuItem>
            <MenuItem value="imaging">Imaging Service</MenuItem>
            <MenuItem value="other">Other Healthcare Provider</MenuItem>
          </Select>
          {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
        </FormControl>
      </Grid>

      {/* Add more organisation details fields */}
    </Grid>
  );

  const renderAccreditationCompliance = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<VerifiedUser />}>
          Accreditation and compliance information helps ensure the quality and safety
          of healthcare services.
        </Alert>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Accreditation Number"
          value={accreditation.accreditationNumber}
          onChange={(e) =>
            setAccreditation({
              ...accreditation,
              accreditationNumber: e.target.value,
            })
          }
          error={!!errors.accreditationNumber}
          helperText={errors.accreditationNumber}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required error={!!errors.accreditationType}>
          <InputLabel>Accreditation Type</InputLabel>
          <Select
            value={accreditation.accreditationType}
            onChange={(e) =>
              setAccreditation({
                ...accreditation,
                accreditationType: e.target.value,
              })
            }
          >
            <MenuItem value="RACGP">RACGP Standards</MenuItem>
            <MenuItem value="AGPAL">AGPAL</MenuItem>
            <MenuItem value="QIP">QIP</MenuItem>
            <MenuItem value="NSQHS">NSQHS Standards</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {errors.accreditationType && (
            <FormHelperText>{errors.accreditationType}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Issue Date"
          value={accreditation.issueDate ? new Date(accreditation.issueDate) : null}
          onChange={(date) =>
            setAccreditation({
              ...accreditation,
              issueDate: date ? format(date, 'yyyy-MM-dd') : '',
            })
          }
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
            },
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Expiry Date"
          value={accreditation.expiryDate ? new Date(accreditation.expiryDate) : null}
          onChange={(date) =>
            setAccreditation({
              ...accreditation,
              expiryDate: date ? format(date, 'yyyy-MM-dd') : '',
            })
          }
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
            },
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Compliance Confirmation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={accreditation.hasPrivacyPolicy}
                  onChange={(e) =>
                    setAccreditation({
                      ...accreditation,
                      hasPrivacyPolicy: e.target.checked,
                    })
                  }
                />
              }
              label="We have a comprehensive privacy policy in place"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={accreditation.hasDataBreachPlan}
                  onChange={(e) =>
                    setAccreditation({
                      ...accreditation,
                      hasDataBreachPlan: e.target.checked,
                    })
                  }
                />
              }
              label="We have a data breach response plan"
            />
          </Grid>
          {/* Add more compliance checkboxes */}
        </Grid>
      </Grid>
    </Grid>
  );

  // Add more render methods for other steps...

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return renderOrganisationDetails();
      case 1:
        return renderAccreditationCompliance();
      // Add cases for other steps
      default:
        return null;
    }
  };

  return (
    <Box maxWidth={800} mx="auto" p={3}>
      <Typography variant="h4" align="center" gutterBottom>
        Healthcare Provider Registration
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
              {isSubmitting ? <CircularProgress size={24} /> : 'Complete Registration'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Policy Dialog */}
      <Dialog
        open={showPolicyDialog}
        onClose={() => setShowPolicyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Security & Privacy Policy Requirements</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            As a healthcare provider participating in My Health Record, you must:
          </Typography>
          <Typography component="ul">
            <li>Maintain appropriate security and access policies</li>
            <li>Ensure staff are properly trained in privacy and security</li>
            <li>Have procedures for handling data breaches</li>
            <li>Regularly review and update your policies</li>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPolicyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
