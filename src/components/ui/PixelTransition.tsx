import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAdaptiveQuality,
  useReducedMotion,
} from "../../hooks/usePerformanceOptimization";

interface PixelTransitionProps {
  src: string;
  alt: string;
  className?: string;
  pixelSize?: number;
  autoRevealDuration?: number;
  delay?: number;
  onComplete?: () => void;
}

interface EnhancedPixel {
  x: number;
  y: number;
  revealed: number; // 0-1 for smooth transitions
  targetRevealed: number;
  opacity: number;
  targetOpacity: number;
  autoRevealDelay: number;
  brightness: number;
  scale: number;
  rotation: number;
}

export default function PixelTransition({
  src,
  alt,
  className = "",
  pixelSize = 8,
  autoRevealDuration = 3000,
  delay = 800,
  onComplete,
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pixels, setPixels] = useState<EnhancedPixel[]>([]);
  const [autoRevealComplete, setAutoRevealComplete] = useState(false);
  const autoRevealTimeoutRef = useRef<NodeJS.Timeout>();

  // Performance optimizations
  const quality = useAdaptiveQuality();
  const shouldReduceMotion = useReducedMotion();

  // Adaptive settings based on performance
  const adaptivePixelSize = shouldReduceMotion
    ? pixelSize * 1.5
    : quality === "low"
    ? pixelSize * 1.2
    : pixelSize;

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setIsLoaded(true);
      setTimeout(() => {
        createPixelGrid();
        startAutoReveal();
      }, delay);
    };
    image.onerror = () => {
      setIsLoaded(true);
    };
    image.src = src;
  }, [src, delay]);

  const createPixelGrid = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const cols = Math.ceil(rect.width / adaptivePixelSize);
    const rows = Math.ceil(rect.height / adaptivePixelSize);

    const pixelArray: EnhancedPixel[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Create organic reveal pattern from center outward
        const centerX = cols / 2;
        const centerY = rows / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2)
        );

        // Add some randomness for organic feel with wave patterns
        const waveX = Math.sin((col / cols) * Math.PI * 2) * 0.3;
        const waveY = Math.cos((row / rows) * Math.PI * 2) * 0.3;
        const randomOffset = (Math.random() - 0.5) * 0.5 + waveX + waveY;
        const autoRevealDelay =
          (distanceFromCenter + randomOffset) * (shouldReduceMotion ? 50 : 80);

        pixelArray.push({
          x: col * adaptivePixelSize,
          y: row * adaptivePixelSize,
          revealed: 0,
          targetRevealed: 0,
          opacity: 1,
          targetOpacity: 1,
          autoRevealDelay: Math.max(0, autoRevealDelay),
          brightness: 1,
          scale: 1,
          rotation: 0,
        });
      }
    }

    setPixels(pixelArray);
  }, [adaptivePixelSize, shouldReduceMotion]);

  const startAutoReveal = useCallback(() => {
    setPixels((prevPixels) => {
      const updatedPixels = prevPixels.map((pixel) => ({ ...pixel }));

      // Start auto reveal animation
      updatedPixels.forEach((pixel, index) => {
        setTimeout(() => {
          setPixels((currentPixels) =>
            currentPixels.map((p, i) =>
              i === index ? { ...p, opacity: 0, revealed: true } : p
            )
          );
        }, pixel.autoRevealDelay);
      });

      return updatedPixels;
    });

    // Mark auto reveal as complete
    autoRevealTimeoutRef.current = setTimeout(() => {
      setAutoRevealComplete(true);
    }, autoRevealDuration);
  }, [autoRevealDuration]);

  useEffect(() => {
    // Check if auto reveal is complete
    if (autoRevealComplete && onComplete) {
      onComplete();
    }
  }, [autoRevealComplete, onComplete]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (autoRevealTimeoutRef.current) {
        clearTimeout(autoRevealTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Background image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Pixel overlay */}
      {isLoaded && (
        <div className="absolute inset-0 z-10">
          {pixels.map((pixel, index) => (
            <motion.div
              key={index}
              className="absolute bg-white"
              style={{
                left: pixel.x,
                top: pixel.y,
                width: adaptivePixelSize,
                height: adaptivePixelSize,
              }}
              initial={{ opacity: 1 }}
              animate={{
                opacity: pixel.opacity,
                scale: pixel.scale,
                rotate: pixel.rotation,
                filter: `brightness(${pixel.brightness})`,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Auto reveal progress indicator */}
      {isLoaded && !autoRevealComplete && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            Revealing...
          </div>
        </motion.div>
      )}
    </div>
  );
}
