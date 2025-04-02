import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  Typography,
  Box,
  IconButton,
  Skeleton,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Info } from '@mui/icons-material';

interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  tooltip?: string;
  minHeight?: number | string;
  noPadding?: boolean;
}

const StyledCard = styled(MuiCard)<{ minheight?: string | number }>(({ theme, minheight }) => ({
  height: '100%',
  minHeight: minheight,
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledCardContent = styled(CardContent)<{ nopadding?: boolean }>(({ theme, nopadding }) => ({
  padding: nopadding ? 0 : theme.spacing(3),
  '&:last-child': {
    paddingBottom: nopadding ? 0 : theme.spacing(3),
  },
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  loading = false,
  tooltip,
  minHeight,
  noPadding = false,
  ...props
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <StyledCard minheight={minHeight} {...props}>
        <StyledCardContent nopadding={noPadding}>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" width="50%" height={32} />
            {subtitle && <Skeleton variant="text" width="30%" height={24} />}
          </Box>
          <Skeleton variant="rectangular" height={100} />
        </StyledCardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard minheight={minHeight} {...props}>
      {(title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: noPadding ? 0 : 3,
            pt: noPadding ? 0 : 3,
            pb: subtitle ? 1 : 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            {tooltip && (
              <IconButton
                size="small"
                sx={{ ml: 0.5, color: theme.palette.text.secondary }}
                aria-label="info"
              >
                <Info fontSize="small" />
              </IconButton>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            px: noPadding ? 0 : 3,
            pb: 2,
          }}
        >
          {subtitle}
        </Typography>
      )}
      <StyledCardContent nopadding={noPadding}>{children}</StyledCardContent>
    </StyledCard>
  );
};

export default Card;
