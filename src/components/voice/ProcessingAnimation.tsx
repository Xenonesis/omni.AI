import { motion } from "framer-motion";
import React from "react";

const ProcessingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-10">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-32 h-32 mb-8 circular-smooth hw-accelerated interactive-smooth"
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          perspective: "1000px",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
          imageRendering: "-webkit-optimize-contrast",
        }}
      >
        {/* Concentric circles with comprehensive anti-aliasing */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 border border-primary-300 circular-smooth hw-accelerated"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            willChange: "opacity",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            imageRendering: "-webkit-optimize-contrast",
          }}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 border border-primary-400 circular-smooth hw-accelerated"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          style={{
            willChange: "opacity",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            imageRendering: "-webkit-optimize-contrast",
          }}
        />
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-400 border border-primary-500 circular-smooth hw-accelerated"
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          style={{
            willChange: "opacity",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            imageRendering: "-webkit-optimize-contrast",
          }}
        />
        <motion.div
          className="absolute inset-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 border border-primary-600 circular-smooth hw-accelerated"
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
          style={{
            willChange: "opacity",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            imageRendering: "-webkit-optimize-contrast",
          }}
        />

        {/* Rotating dots with comprehensive anti-aliasing */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 flex items-center justify-center spinner-smooth hw-accelerated"
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            perspective: "1000px",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            transformOrigin: "center center",
            WebkitTransformOrigin: "center center",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          <div className="relative w-full h-full">
            {/* Top dot */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-primary-600 shadow-lg scale-smooth circular-smooth interactive-smooth"
              style={{
                top: "8px",
                left: "50%",
                transform: "translateX(-50%) translateZ(0)",
                WebkitTransform: "translateX(-50%) translateZ(0)",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
                willChange: "transform",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                imageRendering: "-webkit-optimize-contrast",
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Right dot */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-accent-600 shadow-lg scale-smooth circular-smooth interactive-smooth"
              style={{
                top: "50%",
                right: "8px",
                transform: "translateY(-50%) translateZ(0)",
                WebkitTransform: "translateY(-50%) translateZ(0)",
                boxShadow: "0 2px 8px rgba(168, 85, 247, 0.4)",
                willChange: "transform",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                imageRendering: "-webkit-optimize-contrast",
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.25,
              }}
            />
            {/* Bottom dot */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-success-600 shadow-lg scale-smooth circular-smooth interactive-smooth"
              style={{
                bottom: "8px",
                left: "50%",
                transform: "translateX(-50%) translateZ(0)",
                WebkitTransform: "translateX(-50%) translateZ(0)",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)",
                willChange: "transform",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                imageRendering: "-webkit-optimize-contrast",
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            {/* Left dot */}
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-warning-600 shadow-lg scale-smooth circular-smooth interactive-smooth"
              style={{
                top: "50%",
                left: "8px",
                transform: "translateY(-50%) translateZ(0)",
                WebkitTransform: "translateY(-50%) translateZ(0)",
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
                willChange: "transform",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                imageRendering: "-webkit-optimize-contrast",
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.75,
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      <h2 className="text-xl font-medium text-neutral-800 mb-2 text-center">
        Processing your request
      </h2>

      <p className="text-neutral-600 text-center mb-6">
        Contacting resellers and analyzing the best deals for you
      </p>

      <div className="w-full max-w-md bg-neutral-100 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs mr-3">
              1
            </div>
            <span className="text-sm text-neutral-800">
              Identifying product specifications
            </span>
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="ml-auto"
            >
              <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded">
                Done
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center"
          >
            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs mr-3">
              2
            </div>
            <span className="text-sm text-neutral-800">
              Contacting resellers (5/8)
            </span>
            <motion.div
              animate={{
                opacity: [0, 1, 0],
                x: [0, 3, 0],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-auto"
            >
              <span className="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded">
                In Progress
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="flex items-center opacity-50"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs mr-3">
              3
            </div>
            <span className="text-sm text-neutral-600">Analyzing offers</span>
            <div className="ml-auto">
              <span className="text-xs bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded">
                Pending
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="flex items-center opacity-50"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-white text-xs mr-3">
              4
            </div>
            <span className="text-sm text-neutral-600">
              Preparing recommendations
            </span>
            <div className="ml-auto">
              <span className="text-xs bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded">
                Pending
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingAnimation;
