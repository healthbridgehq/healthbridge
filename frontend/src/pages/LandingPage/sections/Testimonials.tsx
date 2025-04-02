import React from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Grid } from '@mui/material';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Healthcare Provider',
    content: 'HealthBridge has revolutionized how we manage patient data. The AI insights are incredibly valuable for our practice.',
    avatar: '👩‍⚕️',
  },
  {
    name: 'Michael Chen',
    role: 'Patient',
    content: 'I love having all my health records in one secure place. The privacy features give me peace of mind.',
    avatar: '👨',
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Medical Researcher',
    content: 'The platform\'s privacy-preserving analytics capabilities are groundbreaking for medical research.',
    avatar: '👩‍🔬',
  },
];

const Testimonials: React.FC = () => {
  return (
    <Box
      component="section"
      sx={{
        py: 8,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" gutterBottom>
          What Our Users Say
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          mb: 2,
                          fontSize: '2rem',
                          bgcolor: 'primary.main',
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      align="center"
                    >
                      "{testimonial.content}"
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
