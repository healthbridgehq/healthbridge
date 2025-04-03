import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Medication,
  Healing,
  Warning,
  Timeline,
  Info,
  LocalHospital,
  Update,
} from '@mui/icons-material';
import { useHealthSummary } from '../../hooks/useHealthSummary';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

interface HealthSummaryProps {
  patientId: string;
}

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'alert';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
}

interface Condition {
  id: string;
  name: string;
  status: 'active' | 'resolved' | 'inactive';
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedDate: string;
  lastReviewed?: string;
}

export const HealthSummary: React.FC<HealthSummaryProps> = ({ patientId }) => {
  const theme = useTheme();
  const { data, isLoading, error, refetch } = useHealthSummary(patientId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'alert':
        return theme.palette.error.main;
      case 'active':
        return theme.palette.primary.main;
      case 'resolved':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Health Summary</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()}>
            <Update />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Key Health Metrics
          </Typography>
          <Grid container spacing={2}>
            {data?.metrics.map((metric: HealthMetric) => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    position: 'relative',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {metric.name}
                  </Typography>
                  <Box display="flex" alignItems="baseline" my={1}>
                    <Typography variant="h6">
                      {metric.value}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        ml={0.5}
                      >
                        {metric.unit}
                      </Typography>
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(metric.value / 100) * 100}
                    sx={{
                      height: 4,
                      bgcolor: 'background.paper',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getStatusColor(metric.status),
                      },
                    }}
                  />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date(metric.lastUpdated).toLocaleDateString()}
                    </Typography>
                    {metric.status !== 'normal' && (
                      <Tooltip title={`Status: ${metric.status}`}>
                        <Warning
                          sx={{
                            color: getStatusColor(metric.status),
                            fontSize: 16,
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Active Medications */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Active Medications
          </Typography>
          <List>
            {data?.medications
              .filter((med: Medication) => med.status === 'active')
              .map((medication: Medication) => (
                <ListItem
                  key={medication.id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemIcon>
                    <Medication color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={medication.name}
                    secondary={
                      <>
                        {medication.dosage} • {medication.frequency}
                        <br />
                        Started: {new Date(medication.startDate).toLocaleDateString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Grid>

        {/* Active Conditions */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Active Conditions
          </Typography>
          <List>
            {data?.conditions
              .filter((cond: Condition) => cond.status === 'active')
              .map((condition: Condition) => (
                <ListItem
                  key={condition.id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemIcon>
                    <Healing
                      sx={{ color: getStatusColor(condition.severity) }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={condition.name}
                    secondary={
                      <>
                        Severity: {condition.severity}
                        <br />
                        Diagnosed:{' '}
                        {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Grid>

        {/* Important Notes */}
        {data?.importantNotes && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                bgcolor: theme.palette.warning.light,
                color: theme.palette.warning.dark,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Info sx={{ mr: 1 }} />
              <Typography variant="body2">
                {data.importantNotes}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
