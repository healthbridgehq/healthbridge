import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';

const features = [
  {
    icon: <SecurityIcon fontSize="large" />,
    title: 'Privacy First',
    description: 'Your health data is encrypted and secure, giving you complete control over who can access it.',
  },
  {
    icon: <HealthAndSafetyIcon fontSize="large" />,
    title: 'AI-Powered Insights',
    description: 'Get personalized health insights and recommendations powered by advanced AI technology.',
  },
  {
    icon: <DataSaverOnIcon fontSize="large" />,
    title: 'Easy Data Management',
    description: 'Manage all your health records in one place with our intuitive interface.',
  },
];

const Features: React.FC = () => {
  return (
    <Box component="section" sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" gutterBottom>
          Why Choose HealthBridge?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
