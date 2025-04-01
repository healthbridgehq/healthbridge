import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Assessment,
  People,
  Warning,
  Download,
  Info,
  Refresh,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import analytics from '../../utils/analytics';
import { exportToExcel } from '../../utils/export';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const StakeholderDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [dataScope, setDataScope] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stakeholderInsights', timeRange, dataScope],
    queryFn: async () => {
      const response = await api.get('/ai/stakeholder-insights', {
        params: { timeRange, dataScope }
      });
      analytics.trackEvent({
        category: 'AI',
        action: 'Fetch Stakeholder Insights',
        label: `${timeRange}-${dataScope}`,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleExport = async () => {
    try {
      const exportData = await api.get('/ai/export-insights', {
        params: { timeRange, dataScope }
      });
      exportToExcel(exportData.data, `healthbridge-insights-${new Date().toISOString()}`);
      analytics.trackEvent({
        category: 'AI',
        action: 'Export Insights',
        label: `${timeRange}-${dataScope}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        Failed to load insights dashboard
      </Alert>
    );
  }

  const {
    clinicalInsights,
    populationHealth,
    operationalMetrics,
    recommendations
  } = data;

  return (
    <Box>
      {/* Dashboard Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          AI-Powered Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Data Scope</InputLabel>
            <Select
              value={dataScope}
              label="Data Scope"
              onChange={(e) => setDataScope(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Data</MenuItem>
              <MenuItem value="clinical">Clinical Only</MenuItem>
              <MenuItem value="administrative">Administrative</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Dashboard Content */}
      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="dashboard tabs"
          >
            <Tab
              icon={<Assessment />}
              label="Clinical Insights"
              iconPosition="start"
            />
            <Tab
              icon={<People />}
              label="Population Health"
              iconPosition="start"
            />
            <Tab
              icon={<TrendingUp />}
              label="Operational Metrics"
              iconPosition="start"
            />
          </Tabs>

          {/* Clinical Insights Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Clinical Trends Chart */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Clinical Outcome Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={clinicalInsights.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="successRate"
                          stroke="#2196f3"
                          name="Success Rate"
                        />
                        <Line
                          type="monotone"
                          dataKey="readmissionRate"
                          stroke="#f44336"
                          name="Readmission Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Key Metrics */}
              <Grid item xs={12} lg={4}>
                <Grid container spacing={2}>
                  {clinicalInsights.metrics.map((metric) => (
                    <Grid item xs={12} key={metric.label}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" color="textSecondary">
                              {metric.label}
                            </Typography>
                            <Typography variant="h4">
                              {metric.value}
                              {metric.unit && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {' '}{metric.unit}
                                </Typography>
                              )}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <TrendingUp
                                color={metric.trend > 0 ? 'success' : 'error'}
                              />
                              <Typography
                                variant="body2"
                                color={metric.trend > 0 ? 'success.main' : 'error.main'}
                              >
                                {metric.trend > 0 ? '+' : ''}{metric.trend}%
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* AI Recommendations */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AI-Generated Recommendations
                    </Typography>
                    <Grid container spacing={2}>
                      {recommendations.map((rec, index) => (
                        <Grid item xs={12} key={index}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Alert
                              severity={rec.priority}
                              icon={rec.priority === 'warning' ? <Warning /> : <Info />}
                              action={
                                <Chip
                                  label={rec.category}
                                  size="small"
                                  color={rec.priority === 'warning' ? 'warning' : 'info'}
                                />
                              }
                            >
                              <Typography variant="subtitle2">
                                {rec.title}
                              </Typography>
                              <Typography variant="body2">
                                {rec.description}
                              </Typography>
                            </Alert>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Population Health Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {/* Population Health Trends */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Population Health Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={populationHealth.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="healthScore"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="riskScore"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Population Segments */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Population Segments
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={populationHealth.segments}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Risk Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={populationHealth.riskDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {populationHealth.riskDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Operational Metrics Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {/* Efficiency Metrics */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Operational Efficiency
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={operationalMetrics.efficiency}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="processingTime"
                          stroke="#2196f3"
                          name="Processing Time"
                        />
                        <Line
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#4caf50"
                          name="Accuracy"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Performance */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      System Performance Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      {operationalMetrics.performance.map((metric) => (
                        <Grid item xs={12} sm={6} md={3} key={metric.label}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" color="textSecondary">
                                {metric.label}
                              </Typography>
                              <Typography variant="h4">
                                {metric.value}
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {metric.unit}
                                </Typography>
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <TrendingUp
                                  color={metric.status === 'good' ? 'success' : 'error'}
                                />
                                <Typography
                                  variant="body2"
                                  color={metric.status === 'good' ? 'success.main' : 'error.main'}
                                >
                                  {metric.trend}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert severity="info" sx={{ mt: 2 }}>
        This dashboard uses AI to analyze and visualize healthcare data. All insights
        should be validated by healthcare professionals before making clinical decisions.
      </Alert>
    </Box>
  );
};

export default StakeholderDashboard;
