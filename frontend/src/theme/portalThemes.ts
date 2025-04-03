import { Components, PaletteOptions, Theme, ThemeOptions } from '@mui/material';
import { alpha, createTheme } from '@mui/material/styles';
import { AccessibilitySettings } from '../providers/AccessibilityProvider';

type CustomPaletteOptions = PaletteOptions & {
  medical?: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
};

interface ExtendedThemeOptions extends Omit<ThemeOptions, 'palette'> {
  accessibility?: AccessibilitySettings;
  palette?: CustomPaletteOptions;
  components?: Components<Omit<Theme, 'components'>>;
}

// Default theme settings
const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'normal',
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  dyslexicFont: false,
};

// Shared theme options
const sharedTheme: ExtendedThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
};

// Create high contrast variants of colors
const createHighContrastVariant = (color: string): string => {
  // Implementation would ensure color meets WCAG 2.1 contrast guidelines
  return alpha(color, 1);
};

// Function to generate theme based on accessibility settings
const generateTheme = (portalType: 'patient' | 'clinic', settings: AccessibilitySettings): Theme => {
  const isPatientPortal = portalType === 'patient';
  const baseColors = isPatientPortal
    ? {
        primary: '#1E88E5',      // Healing Blue
        secondary: '#43A047',    // Wellness Green
        medical: '#FBC02D',      // Soft Yellow
      }
    : {
        primary: '#5E35B1',      // Professional Purple
        secondary: '#00ACC1',    // Clinical Teal
        medical: '#EC407A',      // Medical Pink
      };

  // Apply high contrast if needed
  const colors = settings.contrast === 'high'
    ? {
        primary: createHighContrastVariant(baseColors.primary),
        secondary: createHighContrastVariant(baseColors.secondary),
        medical: createHighContrastVariant(baseColors.medical),
      }
    : baseColors;

  // Base theme options
  const themeOptions: ExtendedThemeOptions = {
    ...sharedTheme,
    palette: {
      mode: isPatientPortal ? 'light' : 'dark',
      primary: {
        main: colors.primary,
        light: alpha(colors.primary, 0.6),
        dark: alpha(colors.primary, 0.9),
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: alpha(colors.secondary, 0.6),
        dark: alpha(colors.secondary, 0.9),
        contrastText: '#ffffff',
      },
      medical: {
        main: colors.medical,
        light: alpha(colors.medical, 0.6),
        dark: alpha(colors.medical, 0.9),
        contrastText: '#000000',
      },
      background: {
        default: isPatientPortal ? '#f5f5f5' : '#121212',
        paper: isPatientPortal ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: isPatientPortal ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
        secondary: isPatientPortal ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
      },
      divider: isPatientPortal ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    } as CustomPaletteOptions,
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: settings.reducedMotion,
        },
        styleOverrides: {
          root: {
            transition: settings.reducedMotion ? 'none' : 'all 0.2s ease-in-out',
            fontSize: `${settings.fontSize === 'normal' ? 1 : settings.fontSize === 'large' ? 1.2 : 1.4}rem`,
            '&:focus-visible': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: settings.contrast === 'high'
              ? 'none'
              : 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.95))',
            WebkitBackdropFilter: 'blur(10px)',
            backdropFilter: 'blur(10px)',
            transition: settings.reducedMotion ? 'none' : 'all 0.3s ease-in-out',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: settings.contrast === 'high'
              ? colors.primary
              : `linear-gradient(180deg, ${colors.primary}f2 0%, ${colors.primary}cc 100%)`,
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          enterDelay: settings.reducedMotion ? 0 : 200,
          enterNextDelay: settings.reducedMotion ? 0 : 200,
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            '&:focus-visible': {
              outline: `3px solid ${colors.primary}`,
              outlineOffset: '2px',
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontSize: `${settings.fontSize === 'normal' ? 1 : settings.fontSize === 'large' ? 1.2 : 1.4}rem`,
          },
        },
      },
    } as Components<Omit<Theme, 'components'>>,
    accessibility: settings,
  };

  return createTheme(themeOptions);
};

// Helper function to get theme with default settings
export const getPortalTheme = (portalType: 'patient' | 'clinic', settings: Partial<AccessibilitySettings> = {}): Theme => {
  return generateTheme(portalType, { ...defaultSettings, ...settings });
};

// Default themes
export const defaultPatientTheme = getPortalTheme('patient');
export const defaultClinicTheme = getPortalTheme('clinic');

export { generateTheme };

export default generateTheme;
