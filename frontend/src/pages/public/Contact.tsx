import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  useTheme,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  content: string;
  action?: string;
}

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const contactInfo: ContactInfo[] = [
    {
      icon: <EmailIcon sx={{ fontSize: 32 }} />,
      title: 'Email',
      content: 'support@healthbridge.com.au',
      action: 'mailto:support@healthbridge.com.au',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 32 }} />,
      title: 'Phone',
      content: '1300 HEALTH (432584)',
      action: 'tel:1300432584',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 32 }} />,
      title: 'Office',
      content: 'Level 32, 200 George St\nSydney, NSW 2000',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
      title: 'Support Hours',
      content: 'Monday - Friday\n9:00 AM - 5:00 PM AEST',
    },
  ];

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement form submission
    setSubmitted(true);
  };

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
                Get in Touch
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
                We're here to help with any questions about HealthBridge
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, mb: 8 }}>
        <Grid container spacing={8}>
          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              {contactInfo.map((info, index) => (
                <Grid item xs={12} sm={6} md={12} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            color: 'primary.main',
                            mr: 2,
                            p: 1,
                            borderRadius: '50%',
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {info.title}
                        </Typography>
                      </Box>
                      <Typography
                        component={info.action ? 'a' : 'p'}
                        href={info.action}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          '&:hover': info.action
                            ? {
                                color: 'primary.main',
                                textDecoration: 'underline',
                              }
                            : {},
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {info.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                Send us a Message
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      required
                      type="email"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      required
                      multiline
                      rows={4}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{ py: 1.5, px: 4 }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
