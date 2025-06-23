import { useState, useEffect, useCallback } from 'react';
import { BillingService } from '../services/BillingService';

import { Invoice, Payment } from '../types/billing';



export const useClinicBilling = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const billingService = BillingService.getInstance();

  const fetchInvoices = useCallback(async () => {
    try {
      const fetchedInvoices = await billingService.getAllInvoices();
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  }, [billingService]);

  const fetchPayments = useCallback(async () => {
    try {
      const fetchedPayments = await billingService.getAllPayments();
      setPayments(fetchedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }, [billingService]);

  useEffect(() => {
    fetchInvoices();
    fetchPayments();
  }, [fetchInvoices, fetchPayments]);

  const addInvoice = useCallback(async (invoice: Omit<Invoice, 'id'>) => {
    try {
      const newInvoice = await billingService.createInvoice(invoice as any);
      setInvoices(prev => [...prev, newInvoice]);
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  }, [billingService]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    try {
      const updatedInvoice = await billingService.updateInvoice(id, updates);
      setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  }, [billingService]);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      await billingService.updateInvoice(id, { status: 'cancelled' });
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  }, [billingService]);

  const processPayment = useCallback(async (payment: Omit<Payment, 'id'>) => {
    try {
      await billingService.processPayment(payment as any);
      // Update the corresponding invoice status
      const invoice = invoices.find(i => i.id === payment.invoiceId);
      if (invoice) {
        await updateInvoice(invoice.id, { status: 'paid' });
      }
      // Refresh payments list
      const updatedPayments = await billingService.getAllPayments();
      setPayments(updatedPayments);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  }, [billingService, invoices, updateInvoice]);

  const generateReport = useCallback(async (date: string) => {
    try {
      return await billingService.generateReceipt(date);
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }, [billingService]);

  return {
    invoices,
    payments,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    processPayment,
    generateReport,
  };
};
