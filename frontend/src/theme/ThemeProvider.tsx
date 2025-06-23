import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { colors } from './colors';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  highContrast: false,
  toggleHighContrast: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedContrast = localStorage.getItem('highContrast');
      return savedContrast === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('highContrast', highContrast.toString());
  }, [darkMode, highContrast]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: colors.primary.main,
        light: darkMode ? colors.primary.dark : colors.primary.light,
        dark: darkMode ? colors.primary.light : colors.primary.dark,
        contrastText: colors.primary.contrastText,
      },
      secondary: {
        main: colors.secondary.main,
        light: darkMode ? colors.secondary.dark : colors.secondary.light,
        dark: darkMode ? colors.secondary.light : colors.secondary.dark,
        contrastText: colors.secondary.contrastText,
      },
      background: {
        default: darkMode ? colors.background.dark : colors.background.default,
        paper: darkMode ? colors.background.darkPaper : colors.background.paper,
      },
      text: {
        primary: darkMode ? colors.text.darkPrimary : colors.text.primary,
        secondary: darkMode ? colors.text.darkSecondary : colors.text.secondary,
      },
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
      success: colors.success,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: highContrast ? 16 : 14,
      h1: { fontSize: highContrast ? '2.5rem' : '2rem' },
      h2: { fontSize: highContrast ? '2rem' : '1.75rem' },
      h3: { fontSize: highContrast ? '1.75rem' : '1.5rem' },
      h4: { fontSize: highContrast ? '1.5rem' : '1.25rem' },
      h5: { fontSize: highContrast ? '1.25rem' : '1.1rem' },
      h6: { fontSize: highContrast ? '1.1rem' : '1rem' },
      body1: { fontSize: highContrast ? '1.1rem' : '1rem' },
      body2: { fontSize: highContrast ? '1rem' : '0.875rem' },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            '@media (prefers-color-scheme: dark)': {
              backgroundColor: colors.primary.dark,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 500,
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, highContrast, toggleHighContrast }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
