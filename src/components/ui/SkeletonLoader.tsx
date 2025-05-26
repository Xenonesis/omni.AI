import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'product' | 'avatar' | 'button';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  animated = true,
}) => {
  const shimmerAnimation = {
    backgroundPosition: ['200% 0', '-200% 0'],
  };

  const shimmerTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  };

  const baseClasses = `bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${
    animated ? 'animate-shimmer' : ''
  }`;

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full';
      case 'card':
        return 'h-48 w-full';
      case 'product':
        return 'h-64 w-full';
      case 'avatar':
        return 'h-12 w-12 rounded-full';
      case 'button':
        return 'h-10 w-24 rounded-md';
      default:
        return 'h-4 w-full';
    }
  };

  const getCustomStyles = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
    if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
    return styles;
  };

  const renderSkeleton = (index: number) => {
    const skeletonElement = (
      <div
        key={index}
        className={`${baseClasses} ${getVariantClasses()} ${className}`}
        style={getCustomStyles()}
      />
    );

    if (animated) {
      return (
        <motion.div
          key={index}
          animate={shimmerAnimation}
          transition={shimmerTransition}
          className={`${baseClasses} ${getVariantClasses()} ${className}`}
          style={{
            ...getCustomStyles(),
            backgroundSize: '200% 100%',
          }}
        />
      );
    }

    return skeletonElement;
  };

  if (variant === 'product') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            {/* Product Image */}
            <div className={`${baseClasses} h-48 w-full mb-4 rounded`} />
            
            {/* Product Title */}
            <div className={`${baseClasses} h-4 w-3/4 mb-2`} />
            
            {/* Product Price */}
            <div className={`${baseClasses} h-4 w-1/2 mb-2`} />
            
            {/* Product Rating */}
            <div className={`${baseClasses} h-3 w-1/3`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="border rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className={`${baseClasses} h-12 w-12 rounded-full mr-4`} />
              <div className="flex-1">
                <div className={`${baseClasses} h-4 w-1/2 mb-2`} />
                <div className={`${baseClasses} h-3 w-1/3`} />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <div className={`${baseClasses} h-4 w-full`} />
              <div className={`${baseClasses} h-4 w-5/6`} />
              <div className={`${baseClasses} h-4 w-4/6`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;
