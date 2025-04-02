import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
