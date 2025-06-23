import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { motion } from 'framer-motion';

interface TrendSparklineProps {
  data: number[];
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  showSpots?: boolean;
}

const TrendSparkline: React.FC<TrendSparklineProps> = ({
  data,
  label,
  value,
  unit = '',
  color,
  trend,
  showSpots = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartColor = color || theme.palette.primary.main;
  
  const getTrendColor = () => {
    if (!trend) return theme.palette.text.secondary;
    switch (trend) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      case 'stable':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
        >
          {label}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography
            variant="h6"
            component="span"
            sx={{ 
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: 600,
              mr: 1 
            }}
          >
            {value}
            {unit && (
              <Typography
                component="span"
                sx={{
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  color: 'text.secondary',
                  ml: 0.5,
                }}
              >
                {unit}
              </Typography>
            )}
          </Typography>
          {trend && (
            <Typography
              component="span"
              sx={{
                color: getTrendColor(),
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {getTrendIcon()}
            </Typography>
          )}
        </Box>

        <Box sx={{ height: isMobile ? 30 : 40 }}>
          <Sparklines
            data={data}
            width={100}
            height={isMobile ? 30 : 40}
            margin={5}
          >
            <SparklinesLine
              color={chartColor}
              style={{ strokeWidth: 2, fill: 'none' }}
            />
            {showSpots && (
              <SparklinesSpots
                size={isMobile ? 2 : 3}
                style={{
                  stroke: chartColor,
                  strokeWidth: 2,
                  fill: 'white',
                }}
              />
            )}
          </Sparklines>
        </Box>
      </Box>
    </motion.div>
  );
};

export default TrendSparkline;
