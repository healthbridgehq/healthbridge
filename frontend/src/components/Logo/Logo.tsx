import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface LogoProps {
  variant?: 'default' | 'white';
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'default', 
  showText = true,
  size = 'medium'
}) => {
  const theme = useTheme();
  
  const sizes = {
    small: { icon: 24, text: '1rem', stroke: 1.5, point: 3 },
    medium: { icon: 32, text: '1.25rem', stroke: 2, point: 4 },
    large: { icon: 48, text: '1.5rem', stroke: 3, point: 6 },
  } as const;

  const colors = {
    default: {
      primary: theme.palette.primary.main,
      text: theme.palette.text.primary,
    },
    white: {
      primary: '#FFFFFF',
      text: '#FFFFFF',
    },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: sizes[size].icon,
          height: sizes[size].icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection lines */}
          <path
            d="M30 70 L50 30 L70 70 M30 70 L70 70"
            stroke={colors[variant].primary}
            strokeWidth={sizes[size].stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          <circle
            cx="30"
            cy="70"
            r={sizes[size].point}
            fill={colors[variant].primary}
          />
          <circle
            cx="50"
            cy="30"
            r={sizes[size].point}
            fill={colors[variant].primary}
          />
          <circle
            cx="70"
            cy="70"
            r={sizes[size].point}
            fill={colors[variant].primary}
          />
        </svg>
      </Box>
      
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Aeonik", sans-serif',
            fontWeight: 700,
            fontSize: sizes[size].text,
            color: colors[variant].text,
            letterSpacing: '-0.02em',
            marginLeft: 0.5,
          }}
        >
          HealthBridge
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
