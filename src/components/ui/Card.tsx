import React, { ReactNode, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'outline' | 'elevated';
  hoverable?: boolean;
  onClick?: () => void;
  animateOnScroll?: boolean;
  delay?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = false,
  onClick,
  animateOnScroll = false,
  delay = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const baseStyles = 'rounded-lg overflow-hidden transition-all duration-300 ease-out';

  const variantStyles = {
    default: 'bg-white shadow-md hover:shadow-xl',
    glass: 'bg-white/70 backdrop-blur-md shadow-md hover:shadow-xl border border-white/20',
    outline: 'bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-lg',
    elevated: 'bg-white shadow-lg hover:shadow-2xl',
  };

  const hoverStyles = hoverable
    ? 'cursor-pointer transform hover:scale-[1.02]'
    : '';

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const hoverVariants = {
    initial: { y: 0 },
    hover: {
      y: hoverable ? -8 : 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const shouldAnimate = animateOnScroll ? isInView : true;

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial={animateOnScroll ? "hidden" : "visible"}
      animate={shouldAnimate ? "visible" : "hidden"}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <motion.div
        variants={hoverVariants}
        className="relative"
      >
        {children}

        {/* Subtle glow effect on hover */}
        {hoverable && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-accent-500/5 to-primary-500/5 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Card;