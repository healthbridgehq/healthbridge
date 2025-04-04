import React from 'react';
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProviderIdentityCard from '../components/provider/ProviderIdentityCard';
import ProviderIdentityForm from '../components/provider/ProviderIdentityForm';
import PatientPrivacySettings from '../components/patient/PatientPrivacySettings';
import { useProviderIdentity } from '../hooks/useProviderIdentity';
import { colors } from '../theme/colors';

const steps = ['Identity Verification', 'Privacy Settings', 'Review & Confirm'];

const ProviderIdentityPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [editMode, setEditMode] = React.useState(false);
  const {
    profile,
    isLoadingProfile,
    error,
    createProfile,
    updateProfile,
    updatePrivacySettings,
  } = useProviderIdentity();

  const [formData, setFormData] = React.useState({
    identityDetails: null as any,
    privacySettings: {
      consentStatus: 'granted' as 'granted' | 'partial' | 'withdrawn',
      dataSharing: {
        myHealthRecord: true,
        researchParticipation: false,
        thirdPartyAccess: false,
      },
      restrictions: [],
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleIdentitySubmit = async (data: any) => {
    setFormData((prev) => ({
      ...prev,
      identityDetails: data,
    }));
    handleNext();
  };

  const handlePrivacySubmit = async (data: any) => {
    setFormData((prev) => ({
      ...prev,
      privacySettings: data,
    }));
    handleNext();
  };

  const handleFinalSubmit = async () => {
    try {
      if (profile) {
        // Update existing profile
        await updateProfile({
          id: profile.id,
          updates: {
            ...formData.identityDetails,
            privacySettings: formData.privacySettings,
          },
        });
      } else {
        // Create new profile
        await createProfile({
          ...formData.identityDetails,
          privacySettings: formData.privacySettings,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return editMode || !profile ? (
          <ProviderIdentityForm
            initialData={profile}
            onSubmit={handleIdentitySubmit}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <ProviderIdentityCard
            {...profile}
            onEdit={() => setEditMode(true)}
            onVerify={handleNext}
          />
        );
      case 1:
        return (
          <PatientPrivacySettings
            {...formData.privacySettings}
            onUpdateConsent={(status) =>
              setFormData((prev) => ({
                ...prev,
                privacySettings: {
                  ...prev.privacySettings,
                  consentStatus: status,
                },
              }))
            }
            onUpdateDataSharing={(settings) =>
              setFormData((prev) => ({
                ...prev,
                privacySettings: {
                  ...prev.privacySettings,
                  dataSharing: settings,
                },
              }))
            }
            onUpdateRestrictions={(restrictions) =>
              setFormData((prev) => ({
                ...prev,
                privacySettings: {
                  ...prev.privacySettings,
                  restrictions,
                },
              }))
            }
          />
        );
      case 2:
        return (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              backgroundColor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <ProviderIdentityCard {...formData.identityDetails} />
            </Box>
            <Box>
              <PatientPrivacySettings {...formData.privacySettings} />
            </Box>
          </Paper>
        );
      default:
        return null;
    }
  };

  if (isLoadingProfile) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Healthcare Provider Identity Management
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4 }}>{renderStepContent(activeStep)}</Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack}>Back</Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinalSubmit}
            >
              {profile ? 'Save Changes' : 'Complete Registration'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={editMode}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ProviderIdentityPage;
