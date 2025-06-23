import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  useTheme,
  alpha,
  Tab,
  Tabs,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`features-tabpanel-${index}`}
      aria-labelledby={`features-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Features: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const patientFeatures = [
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
      title: 'Unified Health Records',
      description: 'Access and share your complete health history across all your healthcare providers securely.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Privacy First',
      description: 'Bank-level encryption and full compliance with Australian privacy laws and healthcare regulations.',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Scheduling',
      description: 'Book appointments instantly and receive automated reminders to stay on top of your health.',
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: 'AI Health Assistant',
      description: 'Get personalized health insights and recommendations based on your health data.',
    },
  ];

  const clinicFeatures = [
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Practice Analytics',
      description: 'Powerful analytics tools to improve patient care and practice efficiency.',
    },
    {
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 40 }} />,
      title: 'Seamless Integration',
      description: 'Works with Best Practice, Cliniko, and other leading Australian healthcare software.',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Practice Management',
      description: 'Streamline appointments, waitlists, and patient communications in one place.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Data Exchange',
      description: 'Share and receive patient records securely with other healthcare providers.',
    },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'primary.main',
          color: 'white',
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.95)} 100%)`,
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} sx={{ textAlign: 'center' }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Features That Transform Healthcare
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  mb: 4,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Everything you need for modern healthcare management,
                designed specifically for Australia.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 6 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            textColor="primary"
            indicatorColor="primary"
            aria-label="features tabs"
          >
            <Tab
              icon={<PersonIcon />}
              label="For Patients"
              id="features-tab-0"
              aria-controls="features-tabpanel-0"
            />
            <Tab
              icon={<LocalHospitalIcon />}
              label="For Clinics"
              id="features-tab-1"
              aria-controls="features-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {patientFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[4],
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      alignSelf: 'flex-start',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, flex: 1 }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={4}>
            {clinicFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[4],
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      alignSelf: 'flex-start',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.7, flex: 1 }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 8,
            p: 6,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Experience Better Healthcare?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}
          >
            Join thousands of Australians who trust HealthBridge
            for their healthcare management needs.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/patient/register')}
              sx={{ py: 1.5, px: 4 }}
            >
              Sign Up as Patient
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/clinic/register')}
              sx={{ py: 1.5, px: 4 }}
            >
              Register Your Clinic
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Features;
