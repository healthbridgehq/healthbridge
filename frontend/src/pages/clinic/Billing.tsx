import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Receipt,
  Send,
  Download,
  MoreVert,
  AttachMoney,
  AccountBalance,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  fetchInvoices,
  generateInvoice,
  sendInvoice,
  recordPayment,
  fetchPaymentMethods,
  fetchBillingStats,
  Invoice,
  PaymentMethod,
  BillingStats,
} from '../../api/services/clinicService';
import { formatCurrency } from '../../utils/formatUtils';
import { format as formatDate } from 'date-fns';

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

const Billing: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  // Fetch invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>(
    ['invoices', filterStatus, dateRange],
    fetchInvoices
  );

  // Fetch payment methods
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = useQuery<PaymentMethod[]>(
    ['paymentMethods'],
    fetchPaymentMethods
  );

  // Fetch billing stats
  const { data: billingStats, isLoading: isLoadingBillingStats } = useQuery<BillingStats>(
    ['billingStats', dateRange],
    fetchBillingStats
  );

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation<Invoice, Error, string>(
    (appointmentId) => generateInvoice(appointmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
        enqueueSnackbar('Invoice generated successfully', { variant: 'success' });
      },
      onError: (error: any) => {
        enqueueSnackbar(error.message || 'Failed to generate invoice', { variant: 'error' });
      },
    }
  );

  // Send invoice mutation
  const sendMutation = useMutation(sendInvoice, {
    onSuccess: () => {
      enqueueSnackbar('Invoice sent successfully', { variant: 'success' });
      handleCloseMenu();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to send invoice', { variant: 'error' });
    },
  });

  // Record payment mutation
  const paymentMutation = useMutation(recordPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries('invoices');
      enqueueSnackbar('Payment recorded successfully', { variant: 'success' });
      handleClosePaymentDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to record payment', { variant: 'error' });
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, invoice: any) => {
    setSelectedInvoice(invoice);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
    handleCloseMenu();
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentAmount('');
    setPaymentMethod('');
  };

  const handleRecordPayment = () => {
    if (!paymentAmount || !paymentMethod) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }

    paymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
    });
  };

  const handleDownloadInvoice = () => {
    if (selectedInvoice) {
      window.open(selectedInvoice.pdfUrl, '_blank');
      handleCloseMenu();
    }
  };

  const handleSendInvoice = () => {
    if (selectedInvoice) {
      sendMutation.mutate(selectedInvoice.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderBillingStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Revenue
          </Typography>
          <Typography variant="h4" color="primary">
            {formatCurrency(billingStats?.totalRevenue || 0)}
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            +{billingStats?.revenueGrowth || 0}% from last period
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Outstanding Amount
          </Typography>
          <Typography variant="h4" color="error">
            {formatCurrency(billingStats?.outstandingAmount || 0)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {billingStats?.overdueInvoices || 0} overdue invoices
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Average Invoice Value
          </Typography>
          <Typography variant="h4">
            {formatCurrency(billingStats?.averageInvoiceValue || 0)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Collection Rate
          </Typography>
          <Typography variant="h4" color="success.main">
            {billingStats?.collectionRate || 0}%
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderInvoicesTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(invoices || [])
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.number}</TableCell>
                <TableCell>{invoice.patient.name}</TableCell>
                <TableCell>{formatDate(invoice.date)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, invoice)}
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={invoices?.length || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Billing Management</Typography>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Receipt />}
              onClick={() => generateMutation.mutate()}
            >
              Generate Invoices
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          {renderBillingStats()}
        </Grid>

        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="All Invoices" />
                <Tab label="Pending" />
                <Tab label="Paid" />
                <Tab label="Overdue" />
              </Tabs>
            </Box>

            <CardContent>
              <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {isLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : invoices?.length ? (
                renderInvoicesTable()
              ) : (
                <Alert severity="info">No invoices found</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenPaymentDialog}>
          <ListItemText>Record Payment</ListItemText>
          <AttachMoney />
        </MenuItem>
        <MenuItem onClick={handleSendInvoice}>
          <ListItemText>Send Invoice</ListItemText>
          <Send />
        </MenuItem>
        <MenuItem onClick={handleDownloadInvoice}>
          <ListItemText>Download PDF</ListItemText>
          <Download />
        </MenuItem>
      </Menu>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Recording payment for Invoice #{selectedInvoice?.number}
              <br />
              Total Amount: {formatCurrency(selectedInvoice?.amount || 0)}
            </Alert>

            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {paymentMethods?.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          <Button
            onClick={handleRecordPayment}
            variant="contained"
            disabled={paymentMutation.isLoading}
          >
            {paymentMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Record Payment'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Billing;
