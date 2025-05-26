import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  // Enhanced props for optimization
  sizes?: string;
  srcSet?: string;
  priority?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  webpSrc?: string;
  avifSrc?: string;
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
}

// WebP support detection
const supportsWebP = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// AVIF support detection
const supportsAVIF = (() => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
})();

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  sizes,
  srcSet,
  priority = false,
  quality = 75,
  width,
  height,
  webpSrc,
  avifSrc,
  blurDataURL,
  loading = 'lazy',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized placeholder
  const optimizedPlaceholder = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder) return placeholder;

    // Generate a simple SVG placeholder with dimensions
    const w = width || 400;
    const h = height || 400;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14"
              fill="#9ca3af" text-anchor="middle" dy=".3em">Loading...</text>
      </svg>
    `)}`;
  }, [blurDataURL, placeholder, width, height]);

  // Determine the best image source based on browser support
  const getBestImageSrc = useCallback(() => {
    if (supportsAVIF && avifSrc) return avifSrc;
    if (supportsWebP && webpSrc) return webpSrc;
    return src;
  }, [src, webpSrc, avifSrc]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(getBestImageSrc());
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Increased for better UX
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [priority, isInView, getBestImageSrc]);

  // Set initial source for priority images
  useEffect(() => {
    if (priority) {
      setCurrentSrc(getBestImageSrc());
    }
  }, [priority, getBestImageSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    // Fallback to original src if optimized version fails
    if (currentSrc !== src) {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      onError?.();
    }
  }, [currentSrc, src, onError]);

  // Preload critical images
  useEffect(() => {
    if (priority && currentSrc) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = currentSrc;
      if (sizes) link.setAttribute('imagesizes', sizes);
      if (srcSet) link.setAttribute('imagesrcset', srcSet);
      document.head.appendChild(link);

      return () => {
        try {
          document.head.removeChild(link);
        } catch (e) {
          // Link might already be removed
        }
      };
    }
  }, [priority, currentSrc, sizes, srcSet]);

  // Optimized animation variants using only transform and opacity
  const imageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth transition
      }
    }
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        willChange: isLoaded ? 'auto' : 'opacity' // Optimize for animation
      }}
    >
      {/* Optimized Placeholder */}
      <img
        src={optimizedPlaceholder}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
        loading="eager" // Load placeholder immediately
        decoding="sync" // Synchronous decoding for placeholder
      />

      {/* Main Image with Picture element for better format support */}
      {(isInView || priority) && (
        <picture>
          {/* AVIF source for modern browsers */}
          {avifSrc && (
            <source srcSet={avifSrc} type="image/avif" sizes={sizes} />
          )}
          {/* WebP source for supported browsers */}
          {webpSrc && (
            <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
          )}
          {/* Fallback image */}
          <motion.img
            src={currentSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onLoad={handleLoad}
            onError={handleError}
            variants={imageVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            sizes={sizes}
            srcSet={srcSet}
            width={width}
            height={height}
            loading={loading}
            decoding="async" // Asynchronous decoding for better performance
            style={{
              willChange: isLoaded ? 'auto' : 'opacity'
            }}
          />
        </picture>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="text-center text-neutral-500">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      )}

      {/* Loading Shimmer - CSS-only animation for better performance */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 skeleton"
          style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200px 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;
