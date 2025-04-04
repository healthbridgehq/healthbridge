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
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  FolderShared,
  EventNote,
  SmartToy,
  InsertChart,
  Share,
  AccountCircle,
  ExitToApp,
  Notifications,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { notificationService, Notification } from '../../api/services/notificationService';

const drawerWidth = 240;

const Root = styled('div')({
  display: 'flex',
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(8),
}));

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/patient/dashboard' },
  { text: 'Health Records', icon: <FolderShared />, path: '/patient/health-records' },
  { text: 'Appointments', icon: <EventNote />, path: '/patient/appointments' },
  { text: 'AI Assistant', icon: <SmartToy />, path: '/patient/ai-assistant' },
  { text: 'Health Insights', icon: <InsertChart />, path: '/patient/insights' },
  { text: 'Data Sharing', icon: <Share />, path: '/patient/data-sharing' },
];

interface PatientLayoutProps {
  children?: React.ReactNode;
}

const PatientLayout: React.FC<PatientLayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>('notifications', 
    () => notificationService.getNotifications(),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const unreadNotifications = notifications.filter((n: Notification) => !n.read);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/patient/login');
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
            HealthBridge Patient Portal
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotificationOpen}
              >
                <Badge badgeContent={unreadNotifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
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
        <MenuItem onClick={() => navigate('/patient/profile')}>
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
      <Menu
        id="notifications-menu"
        anchorEl={notificationAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      >
        {notifications?.length ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                handleNotificationClose();
                if (notification.link) {
                  navigate(notification.link);
                }
              }}
              sx={{
                backgroundColor: notification.read ? 'inherit' : 'action.hover',
              }}
            >
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationClose}>
            <ListItemText primary="No notifications" />
          </MenuItem>
        )}
      </Menu>
    </Root>
  );
};

export default PatientLayout;
