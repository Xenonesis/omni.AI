/**
 * Performance optimization utilities
 */

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading utility for images
export const createLazyImageObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );
};

// Memory management for large lists
export class VirtualizedList {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop: number = 0;
  private renderCallback: (startIndex: number, endIndex: number) => void;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    visibleCount: number,
    totalCount: number,
    renderCallback: (startIndex: number, endIndex: number) => void
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;
    this.totalCount = totalCount;
    this.renderCallback = renderCallback;
    
    this.setupScrollListener();
  }

  private setupScrollListener() {
    const throttledScroll = throttle(() => {
      this.scrollTop = this.container.scrollTop;
      this.updateVisibleItems();
    }, 16); // ~60fps

    this.container.addEventListener('scroll', throttledScroll);
  }

  private updateVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 1,
      this.totalCount
    );

    this.renderCallback(startIndex, endIndex);
  }

  updateTotalCount(newCount: number) {
    this.totalCount = newCount;
    this.updateVisibleItems();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration);
      return duration;
    };
  }

  recordMetric(label: string, value: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(label: string) {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  observeWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Resource preloading
export const preloadResource = (href: string, as: string, crossorigin?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  
  document.head.appendChild(link);
};

// Critical resource hints
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  const hints = [
    { rel: 'dns-prefetch', href: '//backend.omnidim.io' },
    { rel: 'dns-prefetch', href: '//www.youtube.com' },
    { rel: 'preconnect', href: 'https://backend.omnidim.io' },
    { rel: 'preconnect', href: 'https://api.omniverse.ai' }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
};

// Bundle size optimization
export const loadComponentLazily = <T>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> => {
  return importFunc().then(module => module.default);
};

// Memory cleanup utility
export const createCleanupManager = () => {
  const cleanupTasks: (() => void)[] = [];

  return {
    add: (task: () => void) => {
      cleanupTasks.push(task);
    },
    cleanup: () => {
      cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.warn('Cleanup task failed:', error);
        }
      });
      cleanupTasks.length = 0;
    }
  };
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance();
  monitor.observeWebVitals();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    monitor.cleanup();
  });
}
