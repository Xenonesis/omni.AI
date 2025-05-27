import { useEffect, useRef, useState, useCallback } from 'react';

// Hook for frame rate monitoring and optimization
export function useFrameRate() {
  const [fps, setFps] = useState(60);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        const currentFPS = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(currentFPS);
        setIsLowPerformance(currentFPS < 30);
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { fps, isLowPerformance };
}

// Hook for adaptive quality based on device performance
export function useAdaptiveQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const { isLowPerformance } = useFrameRate();

  useEffect(() => {
    // Check device capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const isHighDPI = window.devicePixelRatio > 1.5;
    
    let calculatedQuality: 'high' | 'medium' | 'low' = 'high';

    // Determine quality based on device capabilities
    if (!gl || deviceMemory < 2 || hardwareConcurrency < 4) {
      calculatedQuality = 'low';
    } else if (deviceMemory < 4 || hardwareConcurrency < 8 || !isHighDPI) {
      calculatedQuality = 'medium';
    }

    // Adjust based on performance
    if (isLowPerformance) {
      calculatedQuality = calculatedQuality === 'high' ? 'medium' : 'low';
    }

    setQuality(calculatedQuality);
  }, [isLowPerformance]);

  return quality;
}

// Hook for optimized animation frame management
export function useOptimizedAnimation(callback: (deltaTime: number) => void, enabled = true) {
  const callbackRef = useRef(callback);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const enabledRef = useRef(enabled);

  // Update refs when props change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const animate = useCallback((currentTime: number) => {
    if (!enabledRef.current) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Throttle to 60fps max
    if (deltaTime >= 16.67) {
      callbackRef.current(deltaTime);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (enabled) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, animate]);

  const start = useCallback(() => {
    if (!animationFrameRef.current) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  return { start, stop };
}

// Hook for memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / 1024 / 1024; // MB
        const total = memory.totalJSHeapSize / 1024 / 1024; // MB
        const percentage = (used / total) * 100;

        setMemoryInfo({ used, total, percentage });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Hook for optimized scroll handling
export function useOptimizedScroll(callback: (scrollY: number) => void, throttleMs = 16) {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      
      if (now - lastCallRef.current >= throttleMs) {
        lastCallRef.current = now;
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          callbackRef.current(window.scrollY);
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [throttleMs]);
}

// Hook for prefers-reduced-motion with performance considerations
export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const { isLowPerformance } = useFrameRate();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = () => {
      // Reduce motion if user prefers it OR if performance is low
      setShouldReduceMotion(mediaQuery.matches || isLowPerformance);
    };

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
    };
  }, [isLowPerformance]);

  return shouldReduceMotion;
}

// Hook for Web Vitals monitoring
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }>({});

  useEffect(() => {
    // Dynamically import web-vitals to avoid bundle size impact
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => setVitals(prev => ({ ...prev, cls: metric.value })));
      getFID((metric) => setVitals(prev => ({ ...prev, fid: metric.value })));
      getFCP((metric) => setVitals(prev => ({ ...prev, fcp: metric.value })));
      getLCP((metric) => setVitals(prev => ({ ...prev, lcp: metric.value })));
      getTTFB((metric) => setVitals(prev => ({ ...prev, ttfb: metric.value })));
    }).catch(() => {
      // Fallback if web-vitals is not available
      console.warn('Web Vitals library not available');
    });
  }, []);

  return vitals;
}
