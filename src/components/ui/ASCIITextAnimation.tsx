import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../utils/optimizedAnimations";

interface ASCIITextAnimationProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

const ASCIITextAnimation: React.FC<ASCIITextAnimationProps> = ({
  text,
  className = "",
  delay = 0,
  speed = 50,
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const shouldReduceMotion = prefersReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      // For reduced motion, show text immediately
      setDisplayedText(text);
      setIsComplete(true);
      setShowCursor(false);
      onComplete?.();
      return;
    }

    const startTimer = setTimeout(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, speed);

        return () => clearTimeout(timer);
      } else if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
        // Hide cursor after completion
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, delay);

    return () => clearTimeout(startTimer);
  }, [
    currentIndex,
    text,
    speed,
    delay,
    isComplete,
    shouldReduceMotion,
    onComplete,
  ]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorTimer);
  }, [showCursor]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const cursorVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`font-mono text-left ${className}`}
    >
      <div className="relative inline-block">
        <span className="whitespace-pre-wrap">{displayedText}</span>
        <AnimatePresence>
          {!isComplete && (
            <motion.span
              variants={cursorVariants}
              animate={showCursor ? "visible" : "hidden"}
              className={`inline-block w-0.5 h-5 bg-current ml-0.5 align-text-top ${
                shouldReduceMotion ? "" : "animate-pulse"
              }`}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ASCIITextAnimation;
