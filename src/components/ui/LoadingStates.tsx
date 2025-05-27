import { motion } from "framer-motion";
import { Loader2, Mic, Package, Search, ShoppingCart } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "accent" | "white";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    accent: "text-accent-600",
    white: "text-white",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className} flex items-center justify-center scale-smooth spinner-smooth hw-accelerated interactive-smooth`}
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
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
};

interface LoadingStateProps {
  type: "search" | "voice" | "products" | "cart" | "general";
  message?: string;
  submessage?: string;
  progress?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message,
  submessage,
  progress,
  className = "",
}) => {
  const getIcon = () => {
    switch (type) {
      case "search":
        return <Search className="w-8 h-8" />;
      case "voice":
        return <Mic className="w-8 h-8" />;
      case "products":
        return <Package className="w-8 h-8" />;
      case "cart":
        return <ShoppingCart className="w-8 h-8" />;
      default:
        return <Loader2 className="w-8 h-8" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "search":
        return "Searching products...";
      case "voice":
        return "Processing voice input...";
      case "products":
        return "Loading products...";
      case "cart":
        return "Updating cart...";
      default:
        return "Loading...";
    }
  };

  const getDefaultSubmessage = () => {
    switch (type) {
      case "search":
        return "Finding the best deals for you";
      case "voice":
        return "Converting speech to text";
      case "products":
        return "Fetching latest product information";
      case "cart":
        return "Synchronizing your selections";
      default:
        return "Please wait a moment";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: type === "general" ? [0, 360] : 0,
          }}
          transition={{
            duration: type === "general" ? 2 : 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4 text-primary-600 border border-primary-300 shadow-lg circular-smooth scale-smooth hw-accelerated interactive-smooth"
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            perspective: "1000px",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            imageRendering: "-webkit-optimize-contrast",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            textRendering: "optimizeLegibility",
          }}
        >
          {getIcon()}
        </motion.div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {message || getDefaultMessage()}
        </h3>

        <p className="text-sm text-gray-600 text-center mb-4">
          {submessage || getDefaultSubmessage()}
        </p>

        {progress !== undefined && (
          <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-primary-400 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  title = "Loading omniverse.AI",
  description = "Preparing your voice shopping experience...",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 mx-auto border border-primary-200 circular-smooth hw-accelerated"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-primary-600 scale-smooth spinner-smooth hw-accelerated interactive-smooth"
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
            <Loader2 className="w-12 h-12" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 text-lg"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center space-x-2"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="w-3 h-3 bg-primary-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingState;
