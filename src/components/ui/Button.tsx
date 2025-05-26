import React, { ButtonHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  glow?: boolean;
  mobileOptimized?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  loading = false,
  glow = false,
  mobileOptimized = false,
  className = '',
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-ring relative overflow-hidden';

  const variantStyles = {
    primary: `bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg ${glow ? 'shadow-glow hover:shadow-glow' : ''}`,
    secondary: `bg-accent-600 text-white hover:bg-accent-700 shadow-md hover:shadow-lg ${glow ? 'shadow-glow-accent hover:shadow-glow-accent' : ''}`,
    outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-50 hover:border-neutral-400 text-neutral-700 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700',
    danger: 'bg-error-500 text-white hover:bg-error-600 shadow-md hover:shadow-lg',
  };

  const sizeStyles = {
    xs: 'text-xs px-2 py-1 rounded-md min-h-touch min-w-touch',
    sm: 'text-xs px-3 py-1.5 rounded-md min-h-touch',
    md: 'text-sm px-4 py-2.5 rounded-md min-h-touch',
    lg: 'text-base px-6 py-3 rounded-lg min-h-touch',
    xl: 'text-lg px-8 py-4 rounded-xl min-h-touch',
  };

  // Mobile-optimized sizes for better touch interaction
  const mobileSizeStyles = {
    xs: 'text-sm px-3 py-2 rounded-md min-h-touch min-w-touch',
    sm: 'text-sm px-4 py-2.5 rounded-md min-h-touch',
    md: 'text-base px-5 py-3 rounded-lg min-h-touch',
    lg: 'text-lg px-6 py-3.5 rounded-lg min-h-touch',
    xl: 'text-xl px-8 py-4 rounded-xl min-h-touch',
  };

  const isDisabled = disabled || loading;
  const disabledStyles = isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  const currentSizeStyles = mobileOptimized ? mobileSizeStyles[size] : sizeStyles[size];

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: isDisabled ? 1 : 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
      scale: isDisabled ? 1 : 0.98,
      transition: { duration: 0.1, ease: "easeOut" }
    }
  };

  const glowVariants = {
    initial: { x: '-100%' },
    hover: {
      x: '100%',
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
    />
  );

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${currentSizeStyles}
        ${disabledStyles}
        ${widthStyles}
        ${mobileOptimized ? 'touch-target' : ''}
        ${className}
      `}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {/* Glow effect overlay */}
      {glow && !isDisabled && (
        <motion.div
          variants={glowVariants}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}

      {/* Button content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <LoadingSpinner />
            {children && <span className="ml-2">{children}</span>}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {icon && (
              <motion.span
                className="mr-2"
                animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {icon}
              </motion.span>
            )}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Button;