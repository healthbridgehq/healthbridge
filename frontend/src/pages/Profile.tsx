import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  HealthAndSafety as HealthIcon,
} from '@mui/icons-material';

const Profile = () => {
  // Mock user data - in real app, this would come from API
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Health St, Medical City, MC 12345',
    emergencyContact: 'Jane Doe (+1 555-987-6543)',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Peanuts'],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6">{user.name}</Typography>
              <Typography color="textSecondary">{user.email}</Typography>
            </Box>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText primary="Phone" secondary={user.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Address" secondary={user.address} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Medical Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Blood Type"
                  value={user.bloodType}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={user.emergencyContact}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies"
                  value={user.allergies.join(', ')}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  margin="normal"
                  multiline
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  // Handle edit profile
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="contained"
                startIcon={<HealthIcon />}
                onClick={() => {
                  // Handle update medical info
                }}
              >
                Update Medical Info
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
