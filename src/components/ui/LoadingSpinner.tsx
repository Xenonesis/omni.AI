import { motion } from "framer-motion";
import { Loader, Mic, Search, Sparkles } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "voice" | "search" | "pulse";
  text?: string;
  className?: string;
  showIcon?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  text,
  className = "",
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const getIcon = () => {
    switch (variant) {
      case "voice":
        return <Mic className={sizeClasses[size]} />;
      case "search":
        return <Search className={sizeClasses[size]} />;
      case "pulse":
        return <Sparkles className={sizeClasses[size]} />;
      default:
        return <Loader className={sizeClasses[size]} />;
    }
  };

  const getAnimation = () => {
    switch (variant) {
      case "voice":
        return {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
        };
      case "search":
        return {
          rotate: 360,
        };
      case "pulse":
        return {
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7],
        };
      default:
        return {
          rotate: 360,
        };
    }
  };

  const getTransition = () => {
    switch (variant) {
      case "voice":
        return {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        };
      case "pulse":
        return {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        };
      default:
        return {
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        };
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {showIcon && (
        <motion.div
          animate={getAnimation()}
          transition={getTransition()}
          className="text-primary-600 mb-2 flex items-center justify-center scale-smooth spinner-smooth hw-accelerated interactive-smooth"
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            perspective: "1000px",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            transformOrigin: "center center",
            WebkitTransformOrigin: "center center",
            imageRendering: "-webkit-optimize-contrast",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            textRendering: "optimizeLegibility",
          }}
        >
          {getIcon()}
        </motion.div>
      )}

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-gray-600 ${textSizeClasses[size]} text-center max-w-xs`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
