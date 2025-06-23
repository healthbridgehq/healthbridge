import { useCallback } from 'react';
import { useAccessibility } from '../providers/AccessibilityProvider';

interface AnnounceOptions {
  priority?: 'polite' | 'assertive';
  timeout?: number;
}

export const useA11yAnnounce = () => {
  const { settings } = useAccessibility();

  const announce = useCallback((message: string, options: AnnounceOptions = {}) => {
    if (!settings.screenReader) return;

    const { priority = 'polite', timeout = 1000 } = options;

    // Create or get the live region
    let liveRegion = document.getElementById('a11y-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('role', 'status');
      liveRegion.style.position = 'absolute';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.padding = '0';
      liveRegion.style.margin = '-1px';
      liveRegion.style.overflow = 'hidden';
      liveRegion.style.clip = 'rect(0, 0, 0, 0)';
      liveRegion.style.whiteSpace = 'nowrap';
      liveRegion.style.border = '0';
      document.body.appendChild(liveRegion);
    }

    // Clear previous message
    liveRegion.textContent = '';

    // Set new message after a brief timeout to ensure announcement
    setTimeout(() => {
      liveRegion!.textContent = message;
    }, 100);

    // Clear message after specified timeout
    setTimeout(() => {
      liveRegion!.textContent = '';
    }, timeout);
  }, [settings.screenReader]);

  return announce;
};
