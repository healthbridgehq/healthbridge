import React from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  EventNote,
  Analytics,
  Receipt,
  Settings,
  Extension,
  AccountCircle,
  ExitToApp,
  Help,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Root = styled('div')({
  display: 'flex',
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  '& *': { color: '#ffffff' },
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    '& .MuiListItemIcon-root': {
      color: theme.palette.text.primary,
    },
    '& .MuiListItemText-root': {
      color: theme.palette.text.primary,
    },
    '& .Mui-selected': {
      backgroundColor: theme.palette.primary.light,
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.main,
      },
      '& .MuiListItemText-root': {
        color: theme.palette.primary.main,
      },
    },
  },
}));

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(8),
}));

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/clinic/dashboard' },
  { text: 'Patients', icon: <People />, path: '/clinic/patients' },
  { text: 'Appointments', icon: <EventNote />, path: '/clinic/appointments' },
  { text: 'Analytics', icon: <Analytics />, path: '/clinic/analytics' },
  { text: 'Billing', icon: <Receipt />, path: '/clinic/billing' },
  { text: 'Settings', icon: <Settings />, path: '/clinic/settings' },
  { text: 'Integration', icon: <Extension />, path: '/clinic/integration' },
  { text: 'Help Centre', icon: <Help />, path: '/help/clinic' },
];

interface ClinicLayoutProps {
  children?: React.ReactNode;
}

const ClinicLayout: React.FC<ClinicLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/clinic/login');
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Root>
      <CssBaseline />
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            HealthBridge Clinic Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              {user?.avatar ? (
                <Avatar src={user.avatar} alt={user.name} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {drawer}
      </StyledDrawer>
      <MainContent>
        <Outlet />
      </MainContent>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => navigate('/clinic/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Root>
  );
};

export default ClinicLayout;
