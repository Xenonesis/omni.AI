import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  imageLoadCount: number;
  totalImages: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    imageLoadCount: 0,
    totalImages: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const startTime = performance.now();
    let renderStartTime = performance.now();

    // Monitor page load performance
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // Monitor render performance
    const handleRenderComplete = () => {
      const renderTime = performance.now() - renderStartTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Monitor image loading
    const images = document.querySelectorAll('img');
    let loadedImages = 0;

    const handleImageLoad = () => {
      loadedImages++;
      setMetrics(prev => ({
        ...prev,
        imageLoadCount: loadedImages,
        totalImages: images.length
      }));
    };

    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    // Set up observers
    window.addEventListener('load', handleLoad);

    // Use requestAnimationFrame to measure render time
    requestAnimationFrame(handleRenderComplete);

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    setIsVisible(true);

    return () => {
      window.removeEventListener('load', handleLoad);
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
      clearTimeout(hideTimer);
    };
  }, [enabled]);

  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  if (!enabled || !isVisible) return null;

  const getPerformanceColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLoadingProgress = () => {
    if (metrics.totalImages === 0) return 100;
    return (metrics.imageLoadCount / metrics.totalImages) * 100;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-lg shadow-lg p-4 min-w-[280px]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-sm text-neutral-900">Performance Monitor</h3>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="ml-auto text-neutral-400 hover:text-neutral-600 text-xs"
            aria-label="Close performance monitor"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* Load Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-neutral-500" />
              <span className="text-neutral-600">Load Time:</span>
            </div>
            <span className={`font-mono ${getPerformanceColor(metrics.loadTime)}`}>
              {metrics.loadTime.toFixed(1)}ms
            </span>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-neutral-500" />
              <span className="text-neutral-600">Render Time:</span>
            </div>
            <span className={`font-mono ${getPerformanceColor(metrics.renderTime)}`}>
              {metrics.renderTime.toFixed(1)}ms
            </span>
          </div>

          {/* Image Loading Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Images:</span>
              <span className="font-mono text-neutral-800">
                {metrics.imageLoadCount}/{metrics.totalImages}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <motion.div
                className="bg-primary-600 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getLoadingProgress()}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Performance Score */}
          <div className="pt-2 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 font-medium">Score:</span>
              <span className={`font-bold ${
                metrics.loadTime < 200 && metrics.renderTime < 100
                  ? 'text-green-600'
                  : metrics.loadTime < 500 && metrics.renderTime < 200
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {metrics.loadTime < 200 && metrics.renderTime < 100
                  ? 'Excellent'
                  : metrics.loadTime < 500 && metrics.renderTime < 200
                  ? 'Good'
                  : 'Needs Improvement'
                }
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PerformanceMonitor;
