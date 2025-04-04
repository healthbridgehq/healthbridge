import { useQuery, useMutation, useQueryClient } from 'react-query';
import { BillingService } from '../services/BillingService';
import { Invoice, Payment, MedicareItem } from '../types/billing';

export const useBilling = () => {
  const queryClient = useQueryClient();
  const billingService = new BillingService();

  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery('invoices', () => billingService.getAllInvoices());

  const {
    data: medicareItems,
    isLoading: isLoadingMedicareItems,
    error: medicareItemsError,
  } = useQuery('medicare-items', () => billingService.getMedicareItems());

  const createInvoiceMutation = useMutation(
    (newInvoice: Omit<Invoice, 'id'>) => billingService.createInvoice(newInvoice),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  const updateInvoiceMutation = useMutation(
    ({ id, updates }: { id: string; updates: Partial<Invoice> }) =>
      billingService.updateInvoice(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  const processPaymentMutation = useMutation(
    (payment: Payment) => billingService.processPayment(payment),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  const submitMedicareMutation = useMutation(
    (invoiceId: string) => billingService.submitToMedicare(invoiceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices');
      },
    }
  );

  return {
    invoices,
    medicareItems,
    isLoadingInvoices,
    isLoadingMedicareItems,
    invoicesError,
    medicareItemsError,
    createInvoice: createInvoiceMutation.mutate,
    updateInvoice: updateInvoiceMutation.mutate,
    processPayment: processPaymentMutation.mutate,
    submitToMedicare: submitMedicareMutation.mutate,
    isCreatingInvoice: createInvoiceMutation.isLoading,
    isUpdatingInvoice: updateInvoiceMutation.isLoading,
    isProcessingPayment: processPaymentMutation.isLoading,
    isSubmittingToMedicare: submitMedicareMutation.isLoading,
  };
};
