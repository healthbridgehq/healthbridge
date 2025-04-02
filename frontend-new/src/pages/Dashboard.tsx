import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  useTheme,
  Avatar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Card from '../components/common/Card';

import HealthInsights from '../components/health/HealthInsights';

const MotionBox = motion(Box);

const Dashboard: React.FC = () => {
  const theme = useTheme();

  const recentPatients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      condition: 'Routine Checkup',
      date: '2025-04-02',
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Michael Chen',
      condition: 'Physical Therapy',
      date: '2025-04-02',
      avatar: 'MC',
    },
    {
      id: 3,
      name: 'Emily Davis',
      condition: 'Follow-up',
      date: '2025-04-01',
      avatar: 'ED',
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
          }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Welcome back, Dr. Smith
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            You have 8 appointments scheduled for today
          </Typography>
        </Box>
      </MotionBox>

      <Grid container spacing={3} sx={{ width: '100%' }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
          <Card
            title="Quick Actions"
            sx={{ height: '100%' }}
          >
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
              >
                New Appointment
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
              >
                Add Patient
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
              >
                Create Health Record
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Recent Patients */}
        <Grid item xs={12} md={8} sx={{ width: '100%' }}>
          <Card
            title="Recent Patients"
            action={
              <Button
                size="small"
                color="primary"
              >
                View All
              </Button>
            }
          >
            <Box>
              {recentPatients.map((patient, index) => (
                <Box
                  key={patient.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom:
                      index < recentPatients.length - 1
                        ? `1px solid ${theme.palette.divider}`
                        : 'none',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      mr: 2,
                    }}
                  >
                    {patient.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {patient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patient.condition}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {patient.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Health Insights Section */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <HealthInsights />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
