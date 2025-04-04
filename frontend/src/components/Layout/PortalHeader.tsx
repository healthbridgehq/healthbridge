import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Typography,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Logo from '../common/Logo';

interface PortalHeaderProps {
  portalType: 'patient' | 'clinic';
  onMenuClick?: () => void;
  elevated?: boolean;
  darkMode: boolean;
  onThemeToggle: () => void;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({
  portalType,
  onMenuClick,
  elevated = true,
  darkMode,
  onThemeToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getPortalColor = () => {
    return portalType === 'patient' 
      ? theme.palette.primary.main
      : theme.palette.secondary.main;
  };

  const getPortalName = () => {
    return portalType === 'patient' ? 'Patient Portal' : 'Clinical Portal';
  };

  return (
    <AppBar
      position="fixed"
      elevation={elevated ? 2 : 0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          height: isMobile ? 64 : 72,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onMenuClick && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{
                display: { xs: 'flex', md: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Logo
            variant="auto"
            size={isMobile ? 'small' : 'medium'}
            withText={!isMobile}
          />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                ml: 2,
                color: getPortalColor(),
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {getPortalName()}
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LightMode
                sx={{
                  fontSize: 20,
                  color: darkMode ? 'text.disabled' : 'warning.main',
                }}
              />
              <Switch
                checked={darkMode}
                onChange={onThemeToggle}
                color="default"
                size="small"
              />
              <DarkMode
                sx={{
                  fontSize: 20,
                  color: darkMode ? 'text.primary' : 'text.disabled',
                }}
              />
            </Box>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PortalHeader;
