import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to HealthBridge
      </Typography>
      <Grid container spacing={3}>
        {/* Health Summary */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Health Summary</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" gutterBottom>
                Last checkup: 2 weeks ago
              </Typography>
              <Typography variant="body2" gutterBottom>
                Upcoming appointments: 1
              </Typography>
              <Typography variant="body2">Active prescriptions: 2</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Privacy Score */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Privacy Score</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" gutterBottom align="center">
                92%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={92}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Your data privacy is well-maintained
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Recent Activity</Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" gutterBottom>
                New lab results uploaded
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                2 hours ago
              </Typography>
              <Typography variant="body2" gutterBottom>
                Consent granted to Dr. Smith
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1 day ago
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
