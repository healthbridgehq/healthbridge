import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HealthAndSafety as HealthIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <HealthIcon /> HealthBridge
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/health-records"
            startIcon={<HealthIcon />}
          >
            Records
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/consent"
            startIcon={<SecurityIcon />}
          >
            Consent
          </Button>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/profile"
            size="large"
          >
            <PersonIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
