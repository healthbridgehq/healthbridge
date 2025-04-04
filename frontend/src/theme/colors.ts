export const colors = {
  primary: {
    main: '#0a334d',
    light: '#1e4d6b',
    dark: '#062436',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#4caf50',
    light: '#6fbf73',
    dark: '#357a38',
    contrastText: '#ffffff',
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    dark: '#121212',
    darkPaper: '#1e1e1e',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    disabled: '#999999',
    darkPrimary: '#ffffff',
    darkSecondary: '#cccccc',
  },
  action: {
    hover: 'rgba(255, 255, 255, 0.1)',
    darkHover: 'rgba(255, 255, 255, 0.05)',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
} as const;

// WCAG 2.1 contrast ratios
export const minimumContrastRatio = {
  normalText: 4.5,  // Level AA for normal text
  largeText: 3,     // Level AA for large text
  enhanced: 7,      // Level AAA
};
