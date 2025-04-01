import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

// Mock data - in real app, this would come from API
const mockConsents = [
  {
    id: 1,
    provider: 'Dr. Smith',
    purpose: 'Primary Care',
    access: ['Medical History', 'Lab Results', 'Prescriptions'],
    validUntil: '2025-06-30',
    active: true,
  },
  {
    id: 2,
    provider: 'City Hospital',
    purpose: 'Emergency Care',
    access: ['All Medical Records'],
    validUntil: '2025-12-31',
    active: true,
  },
];

const ConsentManagement = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Consent Management
      </Typography>

      <Grid container spacing={3}>
        {/* Privacy Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Privacy Overview</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              You have full control over who can access your health records. You can
              grant or revoke access at any time.
            </Typography>
          </Paper>
        </Grid>

        {/* Active Consents */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Active Consents
          </Typography>
          {mockConsents.map((consent) => (
            <Card key={consent.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {consent.provider}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Purpose: {consent.purpose}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Access Granted:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {consent.access.map((item) => (
                      <Chip key={item} label={item} size="small" />
                    ))}
                  </Box>
                </Box>
                <Typography variant="body2">
                  Valid until: {consent.validUntil}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => {
                    // Handle edit consent
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    // Handle revoke consent
                  }}
                >
                  Revoke
                </Button>
              </CardActions>
            </Card>
          ))}
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Privacy Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Emergency Access"
                  secondary="Allow emergency services to access your records in critical situations"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={true}
                    onChange={() => {
                      // Handle toggle
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Research Data Sharing"
                  secondary="Share anonymized data for medical research"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={false}
                    onChange={() => {
                      // Handle toggle
                    }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsentManagement;
