import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Aeonik", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#0B3954',
      light: '#1C5D8B',
      dark: '#082940',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00B4D8',
      light: '#48CAE4',
      dark: '#0096B7',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#CAF0F8',
      light: '#E5F6FA',
      dark: '#90E0EF',
      contrastText: '#0B3954',
    },
    text: {
      primary: '#1B1B1B',
      secondary: '#4B5563',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFC',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': [
          {
            fontFamily: 'Aeonik',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 400,
            src: 'url(/fonts/Aeonik-Regular.woff2) format("woff2")',
          },
          {
            fontFamily: 'Aeonik',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 500,
            src: 'url(/fonts/Aeonik-Medium.woff2) format("woff2")',
          },
          {
            fontFamily: 'Aeonik',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 700,
            src: 'url(/fonts/Aeonik-Bold.woff2) format("woff2")',
          },
        ],
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          padding: '12px 24px',
          fontSize: '1rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px ' + alpha('#0B3954', 0.15),
          },
        },
        contained: {
          backgroundImage: `linear-gradient(120deg, #0B3954, #1C5D8B)`,
          '&:hover': {
            backgroundImage: `linear-gradient(120deg, #082940, #0B3954)`,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px ' + alpha('#0B3954', 0.08),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: '#0B3954',
            },
            '&.Mui-focused': {
              borderColor: '#0B3954',
              boxShadow: '0 0 0 2px ' + alpha('#0B3954', 0.1),
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          boxShadow: '0 1px 2px ' + alpha('#0B3954', 0.05),
          borderBottom: '1px solid ' + alpha('#0B3954', 0.08),
        },
      },
    },
  },
});

export default theme;
