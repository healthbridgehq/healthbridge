import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Color palette inspired by modern healthcare design
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    medical: {
      light: string;
      main: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    medical?: {
      light: string;
      main: string;
      dark: string;
    };
  }
}

let theme = createTheme({
  palette: {
    primary: {
      light: '#42a5f5', // Lighter shade of Deep Blue
      main: '#1E88E5', // Deep Blue - Trust & Security
      dark: '#1565C0', // Darker shade of Deep Blue
      contrastText: '#fff',
    },
    secondary: {
      light: '#66BB6A', // Lighter shade of Teal Green
      main: '#43A047', // Teal Green - Health & Growth
      dark: '#2E7D32', // Darker shade of Teal Green
      contrastText: '#fff',
    },
    medical: {
      light: '#FDD835', // Lighter shade of Soft Yellow
      main: '#FBC02D', // Soft Yellow - Energy & Positivity
      dark: '#F9A825', // Darker shade of Soft Yellow
    },
    error: {
      light: '#ef5350',
      main: '#d32f2f',
      dark: '#c62828',
    },
    warning: {
      light: '#ff9800',
      main: '#ed6c02',
      dark: '#e65100',
    },
    info: {
      light: '#03a9f4',
      main: '#0288d1',
      dark: '#01579b',
    },
    success: {
      light: '#4caf50',
      main: '#2e7d32',
      dark: '#1b5e20',
    },
    neutral: {
      light: '#F9FAFB', // Light Gray - Clean, Modern
      main: '#9e9e9e',
      dark: '#212121', // Dark Gray - High Contrast Text
      contrastText: '#212121',
    },
    background: {
      default: '#F9FAFB', // Light Gray Background
      paper: '#ffffff',
    },
    text: {
      primary: '#212121', // Dark Gray - High Contrast
      secondary: '#424242',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Source Sans Pro',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2d3748',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: alpha('#1976d2', 0.05),
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export default theme;
