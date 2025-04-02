import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
} from '@mui/icons-material';
import Card from './Card';

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label: string;
  };
  icon?: React.ReactNode;
  loading?: boolean;
  tooltip?: string;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  loading = false,
  tooltip,
}) => {
  const theme = useTheme();

  const getTrendIcon = (direction: 'up' | 'down' | 'flat') => {
    const iconProps = { fontSize: 'small' as const };
    switch (direction) {
      case 'up':
        return <TrendingUp {...iconProps} />;
      case 'down':
        return <TrendingDown {...iconProps} />;
      default:
        return <TrendingFlat {...iconProps} />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'flat') => {
    switch (direction) {
      case 'up':
        return theme.palette.success.main;
      case 'down':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  if (loading) {
    return (
      <Card>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width="30%" />
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: theme.typography.fontWeightMedium,
            }}
          >
            {title}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <Info fontSize="small" sx={{ color: theme.palette.text.secondary }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            {value}
          </Typography>
          {icon && <Box sx={{ ml: 1 }}>{icon}</Box>}
        </Box>

        {(subtitle || trend) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: getTrendColor(trend.direction),
                  mr: 1,
                }}
              >
                {getTrendIcon(trend.direction)}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: theme.typography.fontWeightMedium,
                    ml: 0.5,
                  }}
                >
                  {trend.value}%
                </Typography>
              </Box>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default DataCard;
