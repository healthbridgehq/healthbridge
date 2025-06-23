import React from 'react';
import { Box, Container, Typography, TextField, Grid, Card, CardContent, useTheme } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

const SearchWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(6),
  '& .MuiTextField-root': {
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: '30px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }
  }
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
}));

interface Category {
  title: string;
  description: string;
  path: string;
  articleCount: number;
}

interface HelpCentreProps {
  type: 'patient' | 'clinic' | 'public';
}

export const HelpCentre: React.FC<HelpCentreProps> = ({ type }) => {
  const theme = useTheme();

  const categories: Category[] = type === 'public' ? [
    {
      title: 'About HealthBridge',
      description: 'Learn about our platform and how it benefits patients and healthcare providers',
      path: '/help/about',
      articleCount: 4,
    },
    {
      title: 'Getting Started',
      description: 'How to create your account and start using HealthBridge',
      path: '/help/getting-started',
      articleCount: 3,
    },
    {
      title: 'Features Overview',
      description: 'Explore the key features and capabilities of HealthBridge',
      path: '/help/features',
      articleCount: 5,
    },
    {
      title: 'Privacy & Security',
      description: 'Understanding how we protect your health information',
      path: '/help/privacy',
      articleCount: 4,
    },
    {
      title: 'FAQs',
      description: 'Common questions about our platform',
      path: '/help/faqs',
      articleCount: 8,
    },
    {
      title: 'Contact Support',
      description: 'Get in touch with our support team',
      path: '/help/contact',
      articleCount: 2,
    },
  ] : type === 'patient' ? [
    {
      title: 'Getting Started',
      description: 'Learn how to set up your HealthBridge account and start managing your health journey',
      path: '/help/patient/getting-started',
      articleCount: 5,
    },
    {
      title: 'Managing Your Profile',
      description: 'Update your personal information and health details',
      path: '/help/patient/profile',
      articleCount: 4,
    },
    {
      title: 'My Health Record Integration',
      description: 'Connect and manage your My Health Record data',
      path: '/help/patient/my-health-record',
      articleCount: 3,
    },
    {
      title: 'Appointments & Bookings',
      description: 'Schedule, modify, or cancel appointments with your healthcare providers',
      path: '/help/patient/appointments',
      articleCount: 6,
    },
    {
      title: 'Privacy & Security',
      description: 'Understand how we protect your health information',
      path: '/help/patient/privacy',
      articleCount: 4,
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and their solutions',
      path: '/help/patient/troubleshooting',
      articleCount: 8,
    },
  ] : [
    {
      title: 'Getting Started',
      description: 'Set up your clinic on HealthBridge and configure your services',
      path: '/help/clinic/getting-started',
      articleCount: 7,
    },
    {
      title: 'Staff Management',
      description: 'Add and manage clinic staff accounts and permissions',
      path: '/help/clinic/staff',
      articleCount: 5,
    },
    {
      title: 'Patient Records',
      description: 'Manage patient information and health records securely',
      path: '/help/clinic/records',
      articleCount: 6,
    },
    {
      title: 'Integrations',
      description: 'Connect with My Health Record and other healthcare systems',
      path: '/help/clinic/integrations',
      articleCount: 4,
    },
    {
      title: 'Appointments & Calendar',
      description: 'Manage your clinic\'s schedule and appointment system',
      path: '/help/clinic/appointments',
      articleCount: 8,
    },
    {
      title: 'Billing & Reports',
      description: 'Handle payments and generate reports',
      path: '/help/clinic/billing',
      articleCount: 5,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        {type === 'patient' ? 'Patient Help Centre' : 
         type === 'clinic' ? 'Clinic Help Centre' : 
         'Help Centre'}
      </Typography>
      <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6 }}>
        How can we help you today?
      </Typography>

      <SearchWrapper>
        <TextField
          placeholder="Search for help articles..."
          variant="outlined"
          InputProps={{
            startAdornment: <SearchIcon sx={{ ml: 2, mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </SearchWrapper>

      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.path}>
            <CategoryCard>
              <CardContent component={Link} to={category.path} sx={{ textDecoration: 'none', color: 'inherit', height: '100%', display: 'block' }}>
                <Typography variant="h6" gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {category.description}
                </Typography>
                <Typography variant="caption" color="primary">
                  {category.articleCount} articles
                </Typography>
              </CardContent>
            </CategoryCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HelpCentre;
