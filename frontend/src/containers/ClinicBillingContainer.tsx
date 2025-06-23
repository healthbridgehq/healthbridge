import React from 'react';
import { ClinicBilling } from '../components/clinic';
import { useClinicBilling } from '../hooks/useClinicBilling';

const ClinicBillingContainer: React.FC = () => {
  const {
    invoices,
    payments,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    processPayment,
    generateReport,
  } = useClinicBilling();

  return (
    <ClinicBilling
      invoices={invoices}
      payments={payments}
      onAddInvoice={addInvoice}
      onUpdateInvoice={updateInvoice}
      onDeleteInvoice={deleteInvoice}
      onProcessPayment={processPayment}
      onGenerateReport={generateReport}
    />
  );
};

export default ClinicBillingContainer;
