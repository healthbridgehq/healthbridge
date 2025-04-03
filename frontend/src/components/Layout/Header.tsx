import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Logo from '../common/Logo';

interface HeaderProps {
  onMenuClick?: () => void;
  elevated?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  elevated = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                mr: 1,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Logo
            variant="auto"
            size={isMobile ? 'small' : 'medium'}
            withText
          />
        </Box>

        {/* Add any additional header content here */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
