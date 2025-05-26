/**
 * Optimized animation utilities for 60fps performance
 * Uses only CSS transforms and opacity for hardware acceleration
 */

import { Variants, Transition } from 'framer-motion';

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Base transition for smooth 60fps animations
export const smoothTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth motion
  duration: 0.3,
};

// Fast transition for quick interactions
export const fastTransition: Transition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1], // Material Design standard easing
  duration: 0.15,
};

// Slow transition for dramatic effects
export const slowTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.6,
};

// Spring transition for bouncy effects
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// Optimized fade animations using only opacity
export const fadeVariants: Variants = {
  hidden: { 
    opacity: 0,
    transition: smoothTransition
  },
  visible: { 
    opacity: 1,
    transition: smoothTransition
  },
  exit: { 
    opacity: 0,
    transition: fastTransition
  }
};

// Slide animations using only transform
export const slideVariants = {
  up: {
    hidden: { 
      opacity: 0, 
      transform: 'translateY(20px)',
      transition: smoothTransition
    },
    visible: { 
      opacity: 1, 
      transform: 'translateY(0px)',
      transition: smoothTransition
    }
  },
  down: {
    hidden: { 
      opacity: 0, 
      transform: 'translateY(-20px)',
      transition: smoothTransition
    },
    visible: { 
      opacity: 1, 
      transform: 'translateY(0px)',
      transition: smoothTransition
    }
  },
  left: {
    hidden: { 
      opacity: 0, 
      transform: 'translateX(20px)',
      transition: smoothTransition
    },
    visible: { 
      opacity: 1, 
      transform: 'translateX(0px)',
      transition: smoothTransition
    }
  },
  right: {
    hidden: { 
      opacity: 0, 
      transform: 'translateX(-20px)',
      transition: smoothTransition
    },
    visible: { 
      opacity: 1, 
      transform: 'translateX(0px)',
      transition: smoothTransition
    }
  }
};

// Scale animations using only transform
export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'scale(0.95)',
    transition: smoothTransition
  },
  visible: { 
    opacity: 1, 
    transform: 'scale(1)',
    transition: smoothTransition
  },
  hover: { 
    transform: 'scale(1.02)',
    transition: fastTransition
  },
  tap: { 
    transform: 'scale(0.98)',
    transition: fastTransition
  }
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    transform: 'translateY(20px)',
  },
  visible: { 
    opacity: 1, 
    transform: 'translateY(0px)',
    transition: smoothTransition
  }
};

// Button interaction animations
export const buttonVariants: Variants = {
  idle: { 
    transform: 'scale(1)',
    transition: fastTransition
  },
  hover: { 
    transform: 'scale(1.05)',
    transition: fastTransition
  },
  tap: { 
    transform: 'scale(0.95)',
    transition: fastTransition
  }
};

// Card hover animations
export const cardVariants: Variants = {
  idle: { 
    transform: 'translateY(0px)',
    transition: smoothTransition
  },
  hover: { 
    transform: 'translateY(-4px)',
    transition: smoothTransition
  }
};

// Loading spinner animation (optimized)
export const spinnerVariants: Variants = {
  spinning: {
    transform: 'rotate(360deg)',
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Pulse animation for voice indicators
export const pulseVariants: Variants = {
  idle: { 
    transform: 'scale(1)',
    opacity: 1,
    transition: smoothTransition
  },
  listening: {
    transform: 'scale(1.1)',
    opacity: 0.8,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
};

// Modal/overlay animations
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0,
    transform: 'scale(0.95)',
    transition: fastTransition
  },
  visible: { 
    opacity: 1,
    transform: 'scale(1)',
    transition: smoothTransition
  },
  exit: { 
    opacity: 0,
    transform: 'scale(0.95)',
    transition: fastTransition
  }
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Page transition animations
export const pageVariants: Variants = {
  initial: { 
    opacity: 0,
    transform: 'translateX(20px)',
  },
  in: { 
    opacity: 1,
    transform: 'translateX(0px)',
    transition: smoothTransition
  },
  out: { 
    opacity: 0,
    transform: 'translateX(-20px)',
    transition: fastTransition
  }
};

// Utility function to create responsive animations
export const createResponsiveVariants = (
  mobileDistance: number = 10,
  desktopDistance: number = 20
) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const distance = isMobile ? mobileDistance : desktopDistance;
  
  return {
    hidden: { 
      opacity: 0, 
      transform: `translateY(${distance}px)`,
    },
    visible: { 
      opacity: 1, 
      transform: 'translateY(0px)',
      transition: smoothTransition
    }
  };
};

// Performance-optimized animation wrapper
export const withPerformanceOptimization = (variants: Variants) => {
  if (prefersReducedMotion()) {
    // Return static variants for reduced motion
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  return variants;
};

// CSS class-based animations for better performance
export const cssAnimationClasses = {
  fadeIn: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  scaleIn: 'animate-scale-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  // Delay classes for stagger effects
  delay100: 'animate-delay-100',
  delay200: 'animate-delay-200',
  delay300: 'animate-delay-300',
  delay400: 'animate-delay-400',
  delay500: 'animate-delay-500',
};

// Animation performance monitor
export class AnimationPerformanceMonitor {
  private static instance: AnimationPerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isMonitoring = false;

  static getInstance(): AnimationPerformanceMonitor {
    if (!AnimationPerformanceMonitor.instance) {
      AnimationPerformanceMonitor.instance = new AnimationPerformanceMonitor();
    }
    return AnimationPerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.measureFPS();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private measureFPS(): void {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Log warning if FPS drops below 50
      if (this.fps < 50) {
        console.warn(`⚠️ Animation FPS dropped to ${this.fps}. Consider optimizing animations.`);
      }
    }

    requestAnimationFrame(() => this.measureFPS());
  }

  getFPS(): number {
    return this.fps;
  }
}
