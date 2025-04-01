// Basic analytics implementation
// In a production environment, this would be replaced with a proper analytics service

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class Analytics {
  private static instance: Analytics;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  init() {
    if (this.initialized) return;
    
    // Initialize performance monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.logPerformanceMetric(entry);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }

    this.initialized = true;
  }

  private logPerformanceMetric(entry: PerformanceEntry) {
    // Log performance metrics
    console.log(`Performance Metric - ${entry.entryType}:`, {
      name: entry.name,
      value: 'startTime' in entry ? entry.startTime : entry.duration,
      type: entry.entryType,
    });
  }

  trackEvent({ category, action, label, value }: AnalyticsEvent) {
    // In production, send to analytics service
    console.log('Analytics Event:', {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
    });
  }

  trackPageView(path: string) {
    this.trackEvent({
      category: 'Navigation',
      action: 'Page View',
      label: path,
    });
  }

  trackError(error: Error, context?: string) {
    this.trackEvent({
      category: 'Error',
      action: error.name,
      label: `${context}: ${error.message}`,
    });
  }

  trackInteraction(elementId: string, action: string) {
    this.trackEvent({
      category: 'User Interaction',
      action,
      label: elementId,
    });
  }

  trackTiming(category: string, variable: string, value: number) {
    this.trackEvent({
      category: 'Timing',
      action: variable,
      value,
    });
  }
}

// Initialize analytics
const analytics = Analytics.getInstance();
analytics.init();

export default analytics;
