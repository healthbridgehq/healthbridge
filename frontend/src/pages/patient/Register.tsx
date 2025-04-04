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
  CircularProgress,
  Alert,
} from '@mui/material';
import { authService } from '../../api/services/authService';
import { AuthResponse, PatientRegistration } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../components/common/Logo';

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'patient';
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
  medicareNumber: string;
  medicareIRN: string;
  medicareExpiryDate: string;
  acceptedTerms: boolean;
  privacyConsent: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    medicareNumber: '',
    medicareIRN: '',
    medicareExpiryDate: '',
    acceptedTerms: false,
    privacyConsent: false,
  });
  const [formError, setFormError] = useState('');

  const { mutate: register, isLoading, error: registerError } = useMutation<
    AuthResponse,
    Error,
    PatientRegistration
  >(
    (data) => authService.registerPatient({
      ...data,
      address: {
        street: '',
        suburb: '',
        state: '',
        postcode: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phoneNumber: '',
      },
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      medicareNumber: data.medicareNumber,
      medicareIRN: data.medicareIRN,
      medicareExpiryDate: data.medicareExpiryDate,
      acceptedTerms: data.acceptedTerms,
      privacyConsent: data.privacyConsent
    }), {
    onSuccess: (data) => {
      login(data.token, { ...data.user, name: `${data.user.firstName} ${data.user.lastName}` });
      navigate('/patient/dashboard');
    },
    onError: (error) => {
      setFormError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    const { confirmPassword, ...data } = formData;
    register({
      ...data,
      address: {
        street: '',
        suburb: '',
        state: '',
        postcode: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phoneNumber: '',
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
              Create Patient Account
            </Typography>
          </Box>

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/patient/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
