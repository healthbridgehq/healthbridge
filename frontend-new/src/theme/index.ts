import { createTheme, alpha } from '@mui/material/styles';
import { colors, typography, shadows, transitions } from './tokens';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary[500],
      light: colors.primary[400],
      dark: colors.primary[700],
      ...colors.primary,
    },
    secondary: {
      main: colors.success[500],
      light: colors.success[400],
      dark: colors.success[700],
      ...colors.success,
    },
    error: {
      main: colors.error[500],
      light: colors.error[400],
      dark: colors.error[700],
      ...colors.error,
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[400],
      dark: colors.warning[700],
      ...colors.warning,
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      disabled: colors.neutral[400],
    },
    background: {
      default: colors.neutral[50],
      paper: '#FFFFFF',
    },
    divider: colors.neutral[200],
  },
  typography: {
    fontFamily: typography.fontFamily,
    fontWeightRegular: typography.fontWeights.normal,
    fontWeightMedium: typography.fontWeights.medium,
    fontWeightBold: typography.fontWeights.bold,
    h1: {
      fontSize: typography.sizes['4xl'],
      fontWeight: typography.fontWeights.bold,
      lineHeight: typography.lineHeights.tight,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.fontWeights.semibold,
      lineHeight: typography.lineHeights.tight,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.fontWeights.semibold,
      lineHeight: typography.lineHeights.tight,
    },
    h4: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.fontWeights.semibold,
      lineHeight: typography.lineHeights.tight,
    },
    h5: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.fontWeights.semibold,
      lineHeight: typography.lineHeights.tight,
    },
    h6: {
      fontSize: typography.sizes.base,
      fontWeight: typography.fontWeights.semibold,
      lineHeight: typography.lineHeights.tight,
    },
    body1: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
    },
    body2: {
      fontSize: typography.sizes.sm,
      lineHeight: typography.lineHeights.normal,
    },
    button: {
      textTransform: 'none',
      fontWeight: typography.fontWeights.medium,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
    shadows.xl,
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          transition: `all ${transitions.duration.normal} ${transitions.timing.easeInOut}`,
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: shadows.sm,
          '&:hover': {
            boxShadow: shadows.md,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: shadows.md,
          border: `1px solid ${colors.neutral[200]}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: `all ${transitions.duration.normal} ${transitions.timing.easeInOut}`,
            '& fieldset': {
              borderColor: colors.neutral[300],
            },
            '&:hover fieldset': {
              borderColor: colors.primary[400],
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary[500],
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.neutral[50],
          '& .MuiTableCell-root': {
            color: colors.neutral[700],
            fontWeight: typography.fontWeights.semibold,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.neutral[200]}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: alpha(colors.success[500], 0.1),
          borderColor: colors.success[200],
        },
        standardError: {
          backgroundColor: alpha(colors.error[500], 0.1),
          borderColor: colors.error[200],
        },
        standardWarning: {
          backgroundColor: alpha(colors.warning[500], 0.1),
          borderColor: colors.warning[200],
        },
        standardInfo: {
          backgroundColor: alpha(colors.primary[500], 0.1),
          borderColor: colors.primary[200],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: typography.fontWeights.medium,
        },
      },
    },
  },
});

export default theme;
