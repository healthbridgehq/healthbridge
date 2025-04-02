import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type SizeType = 'small' | 'medium';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType;
  size?: SizeType;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'medium',
  ...props
}) => {
  const theme = useTheme();

  const getStatusColors = (status: StatusType) => {
    const colors = {
      success: {
        background: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.dark,
        border: alpha(theme.palette.success.main, 0.2),
      },
      warning: {
        background: alpha(theme.palette.warning.main, 0.1),
        color: theme.palette.warning.dark,
        border: alpha(theme.palette.warning.main, 0.2),
      },
      error: {
        background: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.dark,
        border: alpha(theme.palette.error.main, 0.2),
      },
      info: {
        background: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.dark,
        border: alpha(theme.palette.primary.main, 0.2),
      },
      neutral: {
        background: alpha(theme.palette.grey[500], 0.1),
        color: theme.palette.grey[700],
        border: alpha(theme.palette.grey[500], 0.2),
      },
    };

    return colors[status];
  };

  const { background, color, border } = getStatusColors(status);

  return (
    <Chip
      {...props}
      size={size}
      sx={{
        backgroundColor: background,
        color: color,
        border: `1px solid ${border}`,
        fontWeight: theme.typography.fontWeightMedium,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        height: size === 'small' ? '24px' : '32px',
        '& .MuiChip-icon': {
          color: 'inherit',
        },
        ...props.sx,
      }}
    />
  );
};

export default StatusChip;
