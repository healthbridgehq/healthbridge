import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation } from 'react-query';
import { loginClinic, AuthResponse } from '../../services/api/auth';
import { useSnackbar } from 'notistack';
import Logo from '../../components/common/Logo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: (credentials) => loginClinic(credentials.email, credentials.password),
    onSuccess: async (data) => {
      await login(data.token, data.user);
      enqueueSnackbar('Successfully logged in', { variant: 'success' });
      navigate('/clinic/dashboard');
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to login', { variant: 'error' });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Logo size="large" withText variant="auto" />
            </Box>
            <Typography component="h1" variant="h5" color="textSecondary" gutterBottom>
              Clinic Portal
            </Typography>
          </Box>
          
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Sign in to your clinic account
          </Typography>

          {loginMutation.isError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {loginMutation.error?.message || 'An error occurred during login'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Clinic Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isLoading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => navigate('/clinic/forgot-password')}
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} textAlign="right">
                <Link
                  href="#"
                  variant="body2"
                  onClick={() => navigate('/clinic/register')}
                >
                  Register your clinic
                </Link>
              </Grid>
            </Grid>

            <Box mt={3} mb={2}>
              <Divider>
                <Typography variant="body2" color="textSecondary">
                  OR
                </Typography>
              </Divider>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/clinic/register?software=best-practice')}
                >
                  Best Practice User
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/clinic/register?software=cliniko')}
                >
                  Cliniko User
                </Button>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="body2" color="textSecondary" align="center">
                Are you a patient?{' '}
                <Link href="#" onClick={() => navigate('/patient/login')}>
                  Sign in to Patient Portal
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
