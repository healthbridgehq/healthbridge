import React, { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../common/Logo';

const PublicLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { text: 'Features', path: '/features' },
    { text: 'About', path: '/about' },
    { text: 'Contact', path: '/contact' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const renderNavItems = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.text}
          component={RouterLink}
          to={item.path}
          color="inherit"
          sx={{
            mx: 2,
            textDecoration: 'none',
            '&:hover': {
              color: 'secondary.main',
            },
          }}
        >
          {item.text}
        </Link>
      ))}
      <Button
        variant="outlined"
        color="inherit"
        onClick={() => navigate('/patient/login')}
        sx={{ ml: 2 }}
      >
        Sign In
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate('/patient/register')}
        sx={{ ml: 2 }}
      >
        Get Started
      </Button>
    </>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          backgroundColor: 'primary.main',
          color: 'white',
        },
      }}
    >
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={RouterLink}
            to={item.path}
            onClick={handleMobileMenuToggle}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem
          button
          component={RouterLink}
          to="/patient/login"
          onClick={handleMobileMenuToggle}
        >
          <ListItemText primary="Sign In" />
        </ListItem>
        <ListItem
          button
          component={RouterLink}
          to="/patient/register"
          onClick={handleMobileMenuToggle}
          sx={{ backgroundColor: 'secondary.main' }}
        >
          <ListItemText primary="Get Started" />
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="fixed"
        color="primary"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <RouterLink to="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Logo size="small" variant="light" withText />
              </Box>
            </RouterLink>
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="start"
                onClick={handleMobileMenuToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {renderNavItems()}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      {renderMobileMenu()}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default PublicLayout;
