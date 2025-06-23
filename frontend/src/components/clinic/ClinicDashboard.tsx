import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Divider,
  useTheme,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors } from '../../theme/colors';

interface DashboardStats {
  todayAppointments: number;
  pendingRequests: number;
  activePatients: number;
  totalRevenue: number;
  upcomingAppointments: Array<{
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
  }>;
  recentMessages: Array<{
    id: string;
    sender: string;
    subject: string;
    timestamp: string;
    urgent: boolean;
  }>;
  patientFlow: Array<{
    hour: string;
    scheduled: number;
    actual: number;
  }>;
}

interface ClinicDashboardProps {
  stats: DashboardStats;
  onViewAppointments: () => void;
  onViewMessages: () => void;
  onViewBilling: () => void;
  onViewPatients: () => void;
}

const ClinicDashboard: React.FC<ClinicDashboardProps> = ({
  stats,
  onViewAppointments,
  onViewMessages,
  onViewBilling,
  onViewPatients,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'checked-in':
        return theme.palette.warning.main;
      case 'in-progress':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Today's Appointments
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="primary">
                {stats.todayAppointments}
              </Typography>
              <Button
                size="small"
                onClick={onViewAppointments}
                sx={{ mt: 2 }}
              >
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Active Patients
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="primary">
                {stats.activePatients}
              </Typography>
              <Button
                size="small"
                onClick={onViewPatients}
                sx={{ mt: 2 }}
              >
                View Patients
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Pending Requests
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="error">
                {stats.pendingRequests}
              </Typography>
              <Button
                size="small"
                color="error"
                sx={{ mt: 2 }}
              >
                View Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={1}
            sx={{
              bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  Today's Revenue
                </Typography>
              </Box>
              <Typography variant="h4" component="div" color="primary">
                ${stats.totalRevenue.toLocaleString()}
              </Typography>
              <Button
                size="small"
                onClick={onViewBilling}
                sx={{ mt: 2 }}
              >
                View Billing
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patient Flow Chart */}
      <Card
        elevation={1}
        sx={{
          mb: 4,
          bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Patient Flow Today
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.patientFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scheduled" name="Scheduled" fill={theme.palette.primary.main} />
                <Bar dataKey="actual" name="Actual" fill={theme.palette.secondary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Upcoming Appointments and Messages */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={1}
            sx={{
              bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Upcoming Appointments</Typography>
                <IconButton size="small" onClick={onViewAppointments}>
                  <ScheduleIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {stats.upcomingAppointments.map((appointment) => (
                <Paper
                  key={appointment.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{appointment.patientName}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {appointment.time} - {appointment.type}
                      </Typography>
                    </Box>
                    <Chip
                      label={appointment.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(appointment.status),
                        color: 'white',
                      }}
                    />
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            elevation={1}
            sx={{
              bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Messages</Typography>
                <IconButton size="small" onClick={onViewMessages}>
                  <MessageIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {stats.recentMessages.map((message) => (
                <Paper
                  key={message.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">{message.subject}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        From: {message.sender} - {message.timestamp}
                      </Typography>
                    </Box>
                    {message.urgent && (
                      <Chip
                        label="Urgent"
                        size="small"
                        color="error"
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClinicDashboard;
