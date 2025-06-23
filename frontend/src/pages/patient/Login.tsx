import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from 'react-query';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Grid,
  Alert,
} from '@mui/material';
import { loginPatient, AuthResponse } from '../../services/api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import Logo from '../../components/common/Logo';

// Using AuthResponse from auth service

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation<AuthResponse, Error, { email: string; password: string }>(
    (credentials) => loginPatient(credentials),
    {
      onSuccess: (data) => {
        login(data.token, {
            ...data.user,
            name: `${data.user.firstName} ${data.user.lastName}`
          });
        navigate('/patient/dashboard');
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

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
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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
              Patient Portal
            </Typography>
          </Box>
          
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
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
              variant="contained"
              color="primary"
              fullWidth
              disabled={loginMutation.isLoading}
              sx={{ mb: 2 }}
            >
              {loginMutation.isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <Grid container spacing={2} justifyContent="space-between">
              <Grid item>
                <Link component={RouterLink} to="/patient/forgot-password" variant="body2">
                  Forgot your password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/patient/register" variant="body2">
                  Don't have an account? Sign up
                </Link>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Typography variant="body2" color="textSecondary" align="center">
                Are you a clinic?{' '}
                <Link href="#" onClick={() => navigate('/clinic/login')}>
                  Sign in to Clinic Portal
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
