import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorAlertProps {
  error: Error | null;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {error.message}
    </Alert>
  );
};
