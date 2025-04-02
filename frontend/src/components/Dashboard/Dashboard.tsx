import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Logo from '../Logo';

// Mock data for charts
const patientData = [
  { month: 'Jan', patients: 65 },
  { month: 'Feb', patients: 59 },
  { month: 'Mar', patients: 80 },
  { month: 'Apr', patients: 81 },
  { month: 'May', patients: 56 },
  { month: 'Jun', patients: 55 },
];

const insightData = [
  { day: 'Mon', insights: 4 },
  { day: 'Tue', insights: 3 },
  { day: 'Wed', insights: 2 },
  { day: 'Thu', insights: 6 },
  { day: 'Fri', insights: 8 },
  { day: 'Sat', insights: 3 },
  { day: 'Sun', insights: 2 },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}));

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 72,
            }}
          >
            <Logo />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton>
                <NotificationsIcon />
              </IconButton>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'primary.main',
                }}
              >
                DS
              </Avatar>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h1" gutterBottom>
              Welcome back, Dr. Smith
            </Typography>
            <Typography variant="h4" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>
              Here's what's happening with your patients today
            </Typography>
          </Box>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper>
              <PeopleIcon fontSize="large" />
            </IconWrapper>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ mb: 0 }}>
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper>
              <LocalHospitalIcon fontSize="large" />
            </IconWrapper>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ mb: 0 }}>
                8
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Appointments
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper>
              <TrendingUpIcon fontSize="large" />
            </IconWrapper>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ mb: 0 }}>
                89%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient Satisfaction
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <IconWrapper sx={{ bgcolor: alpha('#00B4D8', 0.1), color: '#00B4D8' }}>
              <TrendingUpIcon fontSize="large" />
            </IconWrapper>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ mb: 0 }}>
                45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI Insights
              </Typography>
            </Box>
          </StatCard>
        </Grid>

        {/* Patient Statistics */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                  Patient Statistics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patient visits over the last 6 months
                </Typography>
              </Box>
              <Button variant="outlined" color="primary">
                View Details
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={patientData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B3954" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0B3954" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" stroke="#4B5563" />
                <YAxis stroke="#4B5563" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#0B3954" 
                  fill="url(#colorPatients)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={4}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                  AI Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Weekly trend
                </Typography>
              </Box>
              <Button variant="outlined" color="secondary">
                View All
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insightData}>
                <defs>
                  <linearGradient id="colorInsights" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00B4D8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" stroke="#4B5563" />
                <YAxis stroke="#4B5563" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="insights" 
                  stroke="#00B4D8" 
                  strokeWidth={2}
                  dot={{ stroke: '#00B4D8', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </StyledPaper>
        </Grid>

        {/* Recent AI Insights */}
        <Grid item xs={12}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                  Recent AI Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest analysis and recommendations
                </Typography>
              </Box>
              <Button variant="contained" color="primary">
                Take Action
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              {[
                {
                  icon: '🔍',
                  title: 'Potential Hypertension Risk',
                  description: 'Patient John D. shows elevated blood pressure patterns in recent measurements.',
                  severity: 'high'
                },
                {
                  icon: '💊',
                  title: 'Medication Interaction Alert',
                  description: 'Review needed for Patient Sarah M.\'s current prescription combination.',
                  severity: 'medium'
                },
                {
                  icon: '📊',
                  title: 'Positive Treatment Outcome',
                  description: 'Diabetic patients show consistent improvement in glucose levels.',
                  severity: 'low'
                }
              ].map((insight, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider sx={{ my: 2 }} />}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(
                          insight.severity === 'high' ? '#ef4444' : 
                          insight.severity === 'medium' ? '#f59e0b' : 
                          '#10b981',
                          0.1
                        ),
                        fontSize: '1.25rem'
                      }}
                    >
                      {insight.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: 
                            insight.severity === 'high' ? '#ef4444' : 
                            insight.severity === 'medium' ? '#f59e0b' : 
                            '#10b981'
                        }}
                      >
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Box>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
    </Box>
  );
};

export default Dashboard;
