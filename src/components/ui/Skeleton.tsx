import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animated = true,
}) => {
  const baseStyles = 'bg-neutral-200 rounded';
  const animatedStyles = animated ? 'skeleton' : '';

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded-md';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      default:
        return 'rounded-md';
    }
  };

  const getSize = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
    return styles;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${baseStyles} ${getVariantStyles()} ${animatedStyles}`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              ...getSize(),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseStyles} ${getVariantStyles()} ${animatedStyles} ${className}`}
      style={getSize()}
    />
  );
};

// Preset skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} />
  </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton className={`h-10 w-32 ${className}`} />
);

export const SkeletonFeature: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 ${className}`}>
    <div className="flex items-center justify-center w-12 h-12 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
    </div>
    <Skeleton variant="text" width="80%" className="mb-2" />
    <Skeleton variant="text" lines={2} />
  </div>
);

export default Skeleton;
