import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useBilling } from '../../hooks/useBilling';
import { colors } from '../../theme/colors';

interface BillingManagerProps {
  mode: 'patient' | 'clinic';
  patientId?: string;
  clinicId?: string;
}

const BillingManager: React.FC<BillingManagerProps> = ({
  mode,
  patientId,
  clinicId,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [selectedInvoice, setSelectedInvoice] = React.useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cvv, setCvv] = React.useState('');

  const {
    invoices,
    isLoadingInvoices,
    processPayment,
    isProcessingPayment,
    downloadInvoice,
    emailInvoice,
  } = useBilling();

  const handlePayment = async () => {
    if (!selectedInvoice) return;

    try {
      await processPayment(selectedInvoice, {
        method: paymentMethod,
        cardNumber,
        expiryDate,
        cvv,
      });
      setPaymentDialogOpen(false);
      // Reset form
      setPaymentMethod('');
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        bgcolor: isDarkMode ? colors.background.darkPaper : colors.background.paper,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Billing Management
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.number}</TableCell>
                <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {invoice.status !== 'paid' && (
                      <Tooltip title="Pay Invoice">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedInvoice(invoice.id);
                            setPaymentDialogOpen(true);
                          }}
                        >
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Download Invoice">
                      <IconButton
                        onClick={() => downloadInvoice(invoice.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Email Invoice">
                      <IconButton
                        onClick={() => emailInvoice(invoice.id)}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print Invoice">
                      <IconButton
                        onClick={() => window.print()}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select a payment method</option>
                <option value="credit">Credit Card</option>
                <option value="debit">Debit Card</option>
                <option value="medicare">Medicare</option>
              </TextField>
            </Grid>
            {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    inputProps={{ maxLength: 16 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    inputProps={{ maxLength: 3 }}
                    type="password"
                  />
                </Grid>
              </>
            )}
            {paymentMethod === 'medicare' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medicare Number"
                  placeholder="Enter your Medicare number"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={!paymentMethod || isProcessingPayment}
            startIcon={<PaymentIcon />}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BillingManager;
