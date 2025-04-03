import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'x-large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  dyslexicFont: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  fontScale: number;
  shouldReduceMotion: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'normal',
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  dyslexicFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Calculate font scale based on fontSize setting
  const getFontScale = () => {
    switch (settings.fontSize) {
      case 'large':
        return 1.2;
      case 'x-large':
        return 1.4;
      default:
        return 1;
    }
  };

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('accessibility-settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Listen for system reduced motion preference
  useEffect(() => {
    updateSettings({ reducedMotion: prefersReducedMotion });
  }, [prefersReducedMotion]);

  // Apply dyslexic font if enabled
  useEffect(() => {
    if (settings.dyslexicFont) {
      // Load OpenDyslexic font
      const link = document.createElement('link');
      link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [settings.dyslexicFont]);

  // Apply screen reader announcements
  useEffect(() => {
    if (settings.screenReader) {
      document.documentElement.setAttribute('role', 'application');
      document.documentElement.setAttribute('aria-label', 'HealthBridge Application');
    } else {
      document.documentElement.removeAttribute('role');
      document.documentElement.removeAttribute('aria-label');
    }
  }, [settings.screenReader]);

  const value = {
    settings,
    updateSettings,
    fontScale: getFontScale(),
    shouldReduceMotion: settings.reducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
