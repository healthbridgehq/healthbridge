import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AccountBalance as AccountIcon,
} from '@mui/icons-material';
import BillingManager from '../shared/BillingManager';
import { usePatientData } from '../../hooks/usePatientData';
import { colors } from '../../theme/colors';

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

const PatientBilling: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = React.useState(0);
  const { patientData } = usePatientData();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate billing summary
  const totalBilled = patientData?.invoices?.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  ) || 0;

  const totalPaid = patientData?.invoices?.reduce(
    (sum, invoice) => (invoice.status === 'paid' ? sum + invoice.amount : sum),
    0
  ) || 0;

  const outstandingAmount = totalBilled - totalPaid;

  return (
    <Paper
      elevation={1}
      sx={{
        bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="billing tabs"
        >
          <Tab
            icon={<ReceiptIcon />}
            label="Invoices & Payments"
            iconPosition="start"
          />
          <Tab
            icon={<AccountIcon />}
            label="Billing Summary"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <BillingManager
          mode="patient"
          patientId={patientData?.profile.id}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Billed
                </Typography>
                <Typography variant="h4" color="primary">
                  ${totalBilled.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Paid
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${totalPaid.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Outstanding Amount
                </Typography>
                <Typography
                  variant="h4"
                  color={outstandingAmount > 0 ? 'error.main' : 'success.main'}
                >
                  ${outstandingAmount.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Medicare Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medicare Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      Medicare Number: {patientData?.profile.medicareNumber}
                    </Typography>
                    <Typography variant="body1">
                      Valid until:{' '}
                      {patientData?.profile.medicareExpiry
                        ? new Date(
                            patientData.profile.medicareExpiry
                          ).toLocaleDateString()
                        : 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      Benefits Used: ${patientData?.profile.medicareUsed || '0.00'}
                    </Typography>
                    <Typography variant="body1">
                      Safety Net Threshold: {patientData?.profile.safetyNetReached ? 'Reached' : 'Not Reached'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Paper>
  );
};

export default PatientBilling;
