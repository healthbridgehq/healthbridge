import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  Tab,
  Tabs,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Save,
  Edit,
  Notifications,
  Security,
  Language,
  Palette,
  Upload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Card from '../components/common/Card';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const MotionBox = motion(Box);

const Settings: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: 'English',
    twoFactorAuth: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked,
    });
  };

  return (
    <Box>
      {/* Header Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
      </MotionBox>

      {/* Settings Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Profile" />
          <Tab label="Notifications" />
          <Tab label="Security" />
          <Tab label="Preferences" />
        </Tabs>
      </Box>

      {/* Profile Settings */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                  alt="Profile Picture"
                />
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  sx={{ mb: 2 }}
                >
                  Upload Photo
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Recommended: Square image, at least 400x400px
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    defaultValue="John"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    defaultValue="Doe"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue="john.doe@example.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    defaultValue="(555) 123-4567"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ px: 4 }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notification Settings */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <List>
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive updates and alerts via email"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange('emailNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive updates and alerts via SMS"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.smsNotifications}
                  onChange={handleSettingChange('smsNotifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>
      </TabPanel>

      {/* Security Settings */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <List>
            <ListItem>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security to your account"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.twoFactorAuth}
                  onChange={handleSettingChange('twoFactorAuth')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Change Password"
                secondary="Update your account password"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small">
                  Change
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>
      </TabPanel>

      {/* Preferences Settings */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <List>
            <ListItem>
              <ListItemText
                primary="Dark Mode"
                secondary="Toggle dark mode theme"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.darkMode}
                  onChange={handleSettingChange('darkMode')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Language"
                secondary="Choose your preferred language"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small">
                  {settings.language}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default Settings;
