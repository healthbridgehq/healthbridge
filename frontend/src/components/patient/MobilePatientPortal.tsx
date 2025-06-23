import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  IconButton,
  SwipeableDrawer,
  useTheme,
  Avatar,
  Badge,
  Fab,
  Paper,
} from '@mui/material';
import {
  Dashboard,
  LocalHospital,
  Description,
  Share,
  Settings,
  Notifications,
  Add,
  HealthAndSafety,
} from '@mui/icons-material';
import {
  ActionButton,
  StyledCard,
  LoadingIndicator,
  Notification,
  ResponsiveContainer,
  useResponsive,
  FadeIn,
} from '../shared/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
  >
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </Box>
);

export const MobilePatientPortal: React.FC = () => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual data from your services
  const healthMetrics = {
    steps: 8432,
    heartRate: 72,
    bloodPressure: '120/80',
    weight: '75kg',
  };

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Smith',
      specialty: 'General Practice',
      date: '2025-04-10T09:30:00',
      clinic: 'City Medical Center',
    },
  ];

  const recentDocuments = [
    {
      id: 1,
      title: 'Blood Test Results',
      date: '2025-04-01',
      type: 'Laboratory',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderHealthDashboard = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Health Overview
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <StyledCard>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {healthMetrics.steps}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Steps Today
            </Typography>
          </Box>
        </StyledCard>
        <StyledCard>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {healthMetrics.heartRate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Heart Rate
            </Typography>
          </Box>
        </StyledCard>
      </Box>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Upcoming Appointments
      </Typography>
      {upcomingAppointments.map((appointment) => (
        <StyledCard key={appointment.id} sx={{ mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {appointment.doctor}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appointment.specialty}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(appointment.date).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appointment.clinic}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <ActionButton
                variant="outlined"
                size="small"
                color="primary"
                onClick={() => {/* Handle reschedule */}}
              >
                Reschedule
              </ActionButton>
            </Box>
          </Box>
        </StyledCard>
      ))}
    </Box>
  );

  const renderDocuments = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Documents
      </Typography>
      {recentDocuments.map((doc) => (
        <StyledCard key={doc.id} sx={{ mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {doc.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {doc.type} • {doc.date}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <ActionButton
                variant="outlined"
                size="small"
                onClick={() => {/* Handle view */}}
              >
                View
              </ActionButton>
              <ActionButton
                variant="outlined"
                size="small"
                onClick={() => {/* Handle share */}}
              >
                Share
              </ActionButton>
            </Box>
          </Box>
        </StyledCard>
      ))}
    </Box>
  );

  const renderDataSharing = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Data Sharing
      </Typography>
      {/* Add data sharing controls */}
    </Box>
  );

  const renderSettings = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>
      {/* Add settings controls */}
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Bar */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          background: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <HealthAndSafety />
            </Avatar>
            <Typography variant="h6">HealthBridge</Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <Badge badgeContent={2} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={activeTab} index={0}>
          {renderHealthDashboard()}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {renderDocuments()}
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          {renderDataSharing()}
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          {renderSettings()}
        </TabPanel>
      </Box>

      {/* Bottom Navigation */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          bottom: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
          zIndex: 1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 56,
              typography: 'body2',
            },
          }}
        >
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<Description />} label="Documents" />
          <Tab icon={<Share />} label="Sharing" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 72,
          zIndex: 2,
        }}
        onClick={() => {/* Handle new action */}}
      >
        <Add />
      </Fab>

      {/* Notifications Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          {/* Add notifications list */}
        </Box>
      </SwipeableDrawer>

      {/* Notification Snackbar */}
      {notification && (
        <Notification
          open={!!notification}
          message={notification.message}
          severity={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingIndicator message="Loading..." />
        </Box>
      )}
    </Box>
  );
};
