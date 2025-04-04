import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HealthAndSafety as HealthIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccessibilityNew as AccessibilityIcon,
  Contrast as ContrastIcon,
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../theme/ThemeProvider';
import { colors } from '../theme/colors';

const Navbar = () => {
  const theme = useTheme();
  const { darkMode, toggleDarkMode, highContrast, toggleHighContrast } = useCustomTheme();
  const [accessibilityMenu, setAccessibilityMenu] = React.useState<null | HTMLElement>(null);

  const handleAccessibilityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAccessibilityMenu(event.currentTarget);
  };

  const handleAccessibilityClose = () => {
    setAccessibilityMenu(null);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: darkMode ? colors.primary.dark : colors.primary.main,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: colors.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
            '&:hover': {
              color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#f5f5f5',
            },
          }}
        >
          <HealthIcon 
            sx={{ 
              color: theme.palette.mode === 'dark' ? 
                colors.secondary.light : 
                colors.secondary.main 
            }} 
          /> 
          HealthBridge
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tooltip title="Dashboard" arrow>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<DashboardIcon />}
              sx={{
                color: colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 
                    colors.action.darkHover : 
                    colors.action.hover,
                },
              }}
            >
              Dashboard
            </Button>
          </Tooltip>

          <Tooltip title="Health Records" arrow>
            <Button
              color="inherit"
              component={RouterLink}
              to="/health-records"
              startIcon={<HealthIcon />}
              sx={{
                color: colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 
                    colors.action.darkHover : 
                    colors.action.hover,
                },
              }}
            >
              Records
            </Button>
          </Tooltip>

          <Tooltip title="Consent Management" arrow>
            <Button
              color="inherit"
              component={RouterLink}
              to="/consent"
              startIcon={<SecurityIcon />}
              sx={{
                color: colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 
                    colors.action.darkHover : 
                    colors.action.hover,
                },
              }}
            >
              Consent
            </Button>
          </Tooltip>

          <Tooltip title="Accessibility Options" arrow>
            <IconButton
              color="inherit"
              onClick={handleAccessibilityClick}
              sx={{
                color: colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 
                    colors.action.darkHover : 
                    colors.action.hover,
                },
              }}
            >
              <AccessibilityIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={accessibilityMenu}
            open={Boolean(accessibilityMenu)}
            onClose={handleAccessibilityClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    icon={<LightModeIcon />}
                    checkedIcon={<DarkModeIcon />}
                  />
                }
                label="Dark Mode"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Switch
                    checked={highContrast}
                    onChange={toggleHighContrast}
                    icon={<ContrastIcon />}
                    checkedIcon={<ContrastIcon />}
                  />
                }
                label="High Contrast"
              />
            </MenuItem>
          </Menu>

          <Tooltip title="Profile" arrow>
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/profile"
              size="large"
              sx={{
                color: colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 
                    colors.action.darkHover : 
                    colors.action.hover,
                },
              }}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
