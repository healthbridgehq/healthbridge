import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  useTheme,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Security,
  AccessTime,
  DataUsage,
  VerifiedUser,
} from '@mui/icons-material';
import {
  ActionButton,
  StyledCard,
  ConsentToggle,
  LoadingIndicator,
  Notification,
  ResponsiveContainer,
  FadeIn,
} from './UIComponents';

interface ConsentOption {
  id: string;
  category: string;
  description: string;
  required: boolean;
  defaultValue: boolean;
  details?: string;
}

interface DataUsagePolicy {
  id: string;
  title: string;
  description: string;
  duration: string;
  purpose: string;
}

interface ConsentManagementProps {
  onConsentUpdate: (consents: Record<string, boolean>) => Promise<void>;
  initialConsents?: Record<string, boolean>;
}

export const ConsentManagement: React.FC<ConsentManagementProps> = ({
  onConsentUpdate,
  initialConsents = {},
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [consents, setConsents] = useState<Record<string, boolean>>(initialConsents);
  const [expanded, setExpanded] = useState<string | false>(false);

  // Mock data - replace with actual data from your backend
  const consentOptions: ConsentOption[] = [
    {
      id: 'health_data',
      category: 'Health Data Collection',
      description: 'Allow collection and storage of your health data',
      required: true,
      defaultValue: true,
      details: 'This includes medical history, test results, and medications',
    },
    {
      id: 'ai_analysis',
      category: 'AI Analysis',
      description: 'Allow AI analysis of your health data for insights',
      required: false,
      defaultValue: true,
      details: 'Our AI helps identify patterns and potential health risks',
    },
    {
      id: 'research',
      category: 'Research Use',
      description: 'Allow anonymous use of your data for research',
      required: false,
      defaultValue: false,
      details: 'Your data helps improve healthcare for everyone',
    },
  ];

  const dataPolicies: DataUsagePolicy[] = [
    {
      id: 'storage',
      title: 'Data Storage',
      description: 'Your data is encrypted and stored securely',
      duration: 'Until you request deletion',
      purpose: 'To provide healthcare services',
    },
    {
      id: 'sharing',
      title: 'Data Sharing',
      description: 'Your data is shared only with your explicit consent',
      duration: 'As specified in sharing settings',
      purpose: 'To coordinate care between providers',
    },
  ];

  const handleConsentChange = (id: string, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onConsentUpdate(consents);
      setNotification({ message: 'Consent preferences updated successfully', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to update consent preferences', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Data Collection Consent',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Please review and consent to the following data collection policies:
          </Typography>
          {consentOptions.map((option) => (
            <FadeIn key={option.id}>
              <StyledCard sx={{ mb: 2 }}>
                <ConsentToggle
                  label={option.category}
                  description={option.description}
                  value={consents[option.id] ?? option.defaultValue}
                  onChange={(checked) => handleConsentChange(option.id, checked)}
                  disabled={option.required}
                />
                {option.details && (
                  <Box sx={{ mt: 1, ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {option.details}
                    </Typography>
                  </Box>
                )}
              </StyledCard>
            </FadeIn>
          ))}
        </Box>
      ),
    },
    {
      label: 'Data Usage Policies',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Review how your data will be used and protected:
          </Typography>
          {dataPolicies.map((policy) => (
            <Accordion
              key={policy.id}
              expanded={expanded === policy.id}
              onChange={handleAccordionChange(policy.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">{policy.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {policy.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Duration: {policy.duration}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DataUsage color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Purpose: {policy.purpose}
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ),
    },
    {
      label: 'Review & Confirm',
      content: (
        <Box>
          <Typography variant="body1" paragraph>
            Please review your consent choices:
          </Typography>
          {Object.entries(consents).map(([id, value]) => {
            const option = consentOptions.find(opt => opt.id === id);
            if (!option) return null;
            return (
              <Box key={id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {option.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {value ? 'Consented' : 'Declined'}
                </Typography>
              </Box>
            );
          })}
          <Alert severity="info" sx={{ mt: 2 }}>
            You can update these preferences at any time in your settings.
          </Alert>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Consent Management
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Control how your health data is collected, used, and shared
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <ActionButton
                  disabled={index === 0}
                  onClick={handleBack}
                >
                  Back
                </ActionButton>
                <ActionButton
                  variant="contained"
                  onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                  loading={loading && index === steps.length - 1}
                >
                  {index === steps.length - 1 ? 'Submit' : 'Continue'}
                </ActionButton>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {notification && (
        <Notification
          open={!!notification}
          message={notification.message}
          severity={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Box>
  );
};
