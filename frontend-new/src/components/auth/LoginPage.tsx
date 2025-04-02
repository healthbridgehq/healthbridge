import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Logo from '../common/Logo';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
  padding: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '440px',
  width: '100%',
  borderRadius: theme.shape.borderRadius * 2,
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  fontSize: '1rem',
}));

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8055/auth/login', {
        email,
        password,
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on user role
      const role = response.data.user.role;
      if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'practitioner') {
        window.location.href = '/practitioner';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper elevation={2}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo size={48} />
          <Typography 
            component="h1" 
            variant="h1" 
            sx={{ 
              mt: 2,
              mb: 1,
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            Welcome back
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center'
            }}
          >
            Sign in to access your HealthBridge dashboard
          </Typography>
        </Box>

        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            variant="outlined"
            required
            fullWidth
            id="email"
            label="Email address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />

          <TextField
            variant="outlined"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'common.white' }} />
            ) : (
              'Sign in'
            )}
          </SubmitButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                href="#" 
                variant="body2"
                sx={{ 
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'none'
                  }
                }}
              >
                Forgot password?
              </Link>
          </Box>
        </Form>
      </StyledPaper>
    </StyledContainer>
  );
};

export default LoginPage;
