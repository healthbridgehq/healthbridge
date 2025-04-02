import React from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h1" gutterBottom>
            Welcome to HealthBridge
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Your secure bridge to better healthcare
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/register"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            href="/about"
          >
            Learn More
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
