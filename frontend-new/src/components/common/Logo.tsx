import React from 'react';
import { Box, useTheme } from '@mui/material';

const Logo: React.FC<{ size?: number }> = ({ size = 40 }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Main circle */}
      <svg width={size} height={size} viewBox="0 0 40 40">
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill={theme.palette.primary.main}
          fillOpacity="0.1"
        />
        
        {/* Data point connections */}
        <path
          d="M12 20 L20 12 L28 20 L20 28 Z"
          stroke={theme.palette.primary.main}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        
        {/* Data points */}
        <circle
          cx="20"
          cy="12"
          r="3"
          fill={theme.palette.primary.main}
        />
        <circle
          cx="28"
          cy="20"
          r="3"
          fill={theme.palette.primary.main}
        />
        <circle
          cx="20"
          cy="28"
          r="3"
          fill={theme.palette.primary.main}
        />
        <circle
          cx="12"
          cy="20"
          r="3"
          fill={theme.palette.primary.main}
        />
        
        {/* Center point */}
        <circle
          cx="20"
          cy="20"
          r="2"
          fill={theme.palette.primary.main}
        />
      </svg>
    </Box>
  );
};

export default Logo;
