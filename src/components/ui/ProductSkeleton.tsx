import React from 'react';
import { motion } from 'framer-motion';

interface ProductSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  count = 8,
  viewMode = 'grid'
}) => {
  const skeletonVariants = {
    loading: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const SkeletonCard = ({ index }: { index: number }) => {
    if (viewMode === 'list') {
      return (
        <motion.div
          variants={skeletonVariants}
          animate="loading"
          className="bg-white rounded-lg shadow-md p-4"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex gap-4">
            {/* Image skeleton */}
            <div className="w-32 h-32 bg-neutral-200 rounded-lg flex-shrink-0" />

            <div className="flex-1 space-y-3">
              {/* Title skeleton */}
              <div className="h-6 bg-neutral-200 rounded w-3/4" />

              {/* Rating skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-neutral-200 rounded" />
                <div className="h-4 bg-neutral-200 rounded w-20" />
              </div>

              {/* Price skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-8 bg-neutral-200 rounded w-32" />
                <div className="h-6 bg-neutral-200 rounded w-20" />
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={skeletonVariants}
        animate="loading"
        className="bg-white rounded-lg shadow-md overflow-hidden"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Image skeleton */}
        <div className="w-full h-48 bg-neutral-200" />

        <div className="p-4 space-y-3">
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-neutral-200 rounded w-full" />
            <div className="h-5 bg-neutral-200 rounded w-2/3" />
          </div>

          {/* Rating skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded w-16" />
          </div>

          {/* Price skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 bg-neutral-200 rounded w-24" />
            <div className="h-6 bg-neutral-200 rounded w-16" />
          </div>

          {/* Seller skeleton */}
          <div className="h-4 bg-neutral-200 rounded w-32" />
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`grid gap-3 sm:gap-4 md:gap-6 ${
      viewMode === 'grid'
        ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        : 'grid-cols-1'
    }`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} index={index} />
      ))}
    </div>
  );
};

export default ProductSkeleton;
