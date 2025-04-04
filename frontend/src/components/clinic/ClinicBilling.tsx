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
  Button,
  useTheme,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AccountBalance as AccountIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import BillingManager from '../shared/BillingManager';
import { useClinicStaff } from '../../hooks/useClinicStaff';
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

const ClinicBilling: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [tabValue, setTabValue] = React.useState(0);
  const { staffData } = useClinicStaff();
  const [createInvoiceOpen, setCreateInvoiceOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState('');
  const [selectedService, setSelectedService] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateInvoice = () => {
    // Add invoice creation logic here
    setCreateInvoiceOpen(false);
    // Reset form
    setSelectedPatient('');
    setSelectedService('');
    setAmount('');
    setDescription('');
  };

  // Calculate billing statistics
  const totalRevenue = staffData?.billing?.reduce(
    (sum, invoice) => (invoice.status === 'paid' ? sum + invoice.amount : sum),
    0
  ) || 0;

  const outstandingPayments = staffData?.billing?.reduce(
    (sum, invoice) => (invoice.status === 'pending' ? sum + invoice.amount : sum),
    0
  ) || 0;

  const medicarePayments = staffData?.billing?.reduce(
    (sum, invoice) =>
      invoice.paymentMethod === 'medicare' && invoice.status === 'paid'
        ? sum + invoice.amount
        : sum,
    0
  ) || 0;

  // Mock data for services
  const services = [
    { id: '1', name: 'Standard Consultation', fee: 85.00 },
    { id: '2', name: 'Long Consultation', fee: 150.00 },
    { id: '3', name: 'Telehealth Consultation', fee: 75.00 },
    { id: '4', name: 'Procedure', fee: 200.00 },
  ];

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
            icon={<AssessmentIcon />}
            label="Financial Summary"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateInvoiceOpen(true)}
          >
            Create New Invoice
          </Button>
        </Box>
        <BillingManager
          mode="clinic"
          clinicId={staffData?.clinic.id}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Financial Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="success.main">
                  ${totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Outstanding Payments
                </Typography>
                <Typography variant="h4" color="error.main">
                  ${outstandingPayments.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending invoices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medicare Payments
                </Typography>
                <Typography variant="h4" color="primary">
                  ${medicarePayments.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Processed claims
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Statistics
                </Typography>
                <Grid container spacing={2}>
                  {services.map((service) => (
                    <Grid item xs={12} sm={6} md={3} key={service.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="subtitle1">{service.name}</Typography>
                        <Typography variant="h6" color="primary">
                          ${service.fee.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Base fee
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Create Invoice Dialog */}
      <Dialog
        open={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Patient"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
              >
                {staffData?.patients?.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Service"
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  const service = services.find((s) => s.id === e.target.value);
                  if (service) {
                    setAmount(service.fee.toString());
                  }
                }}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name} - ${service.fee.toFixed(2)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateInvoiceOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateInvoice}
            variant="contained"
            disabled={!selectedPatient || !selectedService || !amount}
          >
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ClinicBilling;
