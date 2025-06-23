import React from 'react';
import {
  Button,
  Card,
  TextField,
  Switch,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  AlertProps,
  ButtonProps,
  CardProps,
  TextFieldProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom button with loading state
interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
}

export const ActionButton = styled(({ loading, icon, children, ...props }: LoadingButtonProps) => (
  <Button
    disabled={loading}
    startIcon={loading ? <CircularProgress size={20} /> : icon}
    {...props}
  >
    {children}
  </Button>
))(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  '&.MuiButton-containedPrimary': {
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
}));

// Card with consistent styling
export const StyledCard = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'visible',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
}));

// Enhanced text field with consistent styling
export const StyledTextField = styled(TextField)<TextFieldProps>(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      },
    },
  },
}));

// Consent toggle with label
interface ConsentToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ConsentToggle: React.FC<ConsentToggleProps> = ({
  label,
  description,
  value,
  onChange,
  disabled,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2,
      borderRadius: 1,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {label}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
    <Switch
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
  </Box>
);

// Loading indicator with optional message
interface LoadingIndicatorProps {
  message?: string;
  size?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  size = 40,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
    }}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        {message}
      </Typography>
    )}
  </Box>
);

// Enhanced notification snackbar
interface NotificationProps extends Omit<AlertProps, 'children'> {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  onClose,
  severity = 'success',
  autoHideDuration = 6000,
  ...props
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert
      onClose={onClose}
      severity={severity}
      elevation={6}
      variant="filled"
      {...props}
    >
      {message}
    </Alert>
  </Snackbar>
);

// Responsive container for consistent padding
export const ResponsiveContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
  },
}));

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      textAlign: 'center',
    }}
  >
    {icon && <Box sx={{ mb: 2, color: 'text.secondary' }}>{icon}</Box>}
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400 }}
      >
        {description}
      </Typography>
    )}
    {action}
  </Box>
);

// Hook for responsive design
export const useResponsive = () => {
  const theme = useTheme();
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
  };
};

// Animation components
export const FadeIn = styled(Box)(({ theme }) => ({
  animation: 'fadeIn 0.5s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

export const SlideIn = styled(Box)(({ theme }) => ({
  animation: 'slideIn 0.3s ease-in-out',
  '@keyframes slideIn': {
    '0%': {
      opacity: 0,
      transform: 'translateX(-20px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
}));
