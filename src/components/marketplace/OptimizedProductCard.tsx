import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { Product } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import LazyImage from '../ui/LazyImage';
import {
  cardVariants,
  staggerItem,
  withPerformanceOptimization,
  prefersReducedMotion
} from '../../utils/optimizedAnimations';

interface OptimizedProductCardProps {
  product: Product;
  index?: number;
  viewMode?: 'grid' | 'list';
}

const OptimizedProductCard: React.FC<OptimizedProductCardProps> = memo(({
  product,
  index = 0,
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const { getBestOffer, getSellerById } = useMarketplace();
  const { state: appState, dispatch: appDispatch } = useAppContext();

  // Memoize expensive calculations
  const bestOffer = React.useMemo(() => getBestOffer(product.id), [product.id, getBestOffer]);
  const seller = React.useMemo(() =>
    bestOffer ? getSellerById(bestOffer.sellerId) : null,
    [bestOffer, getSellerById]
  );
  const savings = React.useMemo(() =>
    bestOffer ? product.basePrice - bestOffer.price : 0,
    [bestOffer, product.basePrice]
  );

  // Check if product is saved
  const isSaved = useMemo(() =>
    appState.savedDeals.some(deal => deal.offer.id === product.id),
    [appState.savedDeals, product.id]
  );

  const handleClick = useCallback(() => {
    navigate(`/product/${product.id}`);
  }, [navigate, product.id]);

  const handleSaveToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    console.log('💾 Save toggle clicked:', {
      productId: product.id,
      productName: product.name,
      isSaved,
      currentSavedDeals: appState.savedDeals.length
    });

    if (isSaved) {
      console.log('🗑️ Removing saved deal:', product.id);
      appDispatch({ type: 'REMOVE_SAVED_DEAL', payload: product.id });
    } else {
      const dealToSave = {
        offer: {
          id: product.id,
          sellerId: seller?.id || 'direct',
          sellerName: seller?.name || 'Direct',
          sellerLogo: seller?.logo,
          productId: product.id,
          price: bestOffer?.price || product.basePrice,
          currency: 'INR',
          stock: 10, // Default stock value
          estimatedDeliveryDays: 3,
          reputationScore: seller?.rating || product.averageRating,
          returnPolicy: '30 days',
          // Extended properties for display (these will be preserved in localStorage)
          productName: product.name,
          originalPrice: product.basePrice,
          rating: product.averageRating,
          deliveryTime: '2-3 days',
          shippingCost: 0,
          inStock: product.stockStatus === 'in-stock',
          imageUrl: product.images[0],
          productUrl: `/product/${product.id}`,
        } as any, // Type assertion to allow extended properties
        totalScore: product.averageRating * 20,
        priceScore: 85,
        deliveryScore: 90,
        reputationScore: product.averageRating * 20,
        returnPolicyScore: 95,
      };
      console.log('💾 Saving deal:', dealToSave);
      appDispatch({ type: 'SAVE_DEAL', payload: dealToSave });
    }
  }, [isSaved, appDispatch, product, bestOffer, seller, appState.savedDeals.length]);

  // Optimized animation variants using only transform and opacity
  const optimizedCardVariants = useMemo(() => {
    const baseVariants = {
      hidden: {
        opacity: 0,
        transform: 'translateY(20px)'
      },
      visible: {
        opacity: 1,
        transform: 'translateY(0px)',
        transition: {
          duration: prefersReducedMotion() ? 0.1 : 0.3,
          delay: Math.min((index || 0) * 0.05, 0.5), // Cap delay to prevent long waits
          ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth motion
        }
      }
    };

    return withPerformanceOptimization(baseVariants);
  }, [index]);

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <Card
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={handleClick}
        >
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0">
              <LazyImage
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-neutral-900 mb-1 sm:mb-2 line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center mb-1 sm:mb-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-xs sm:text-sm text-neutral-600">
                  {product.averageRating} ({product.totalReviews})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {bestOffer ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-primary-600">
                        Rs.{bestOffer.price.toLocaleString()}
                      </span>
                      {savings > 0 && (
                        <span className="text-sm text-neutral-500 line-through">
                          Rs.{product.basePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-neutral-900">
                      Rs.{product.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.stockStatus === 'in-stock' ? 'bg-green-100 text-green-700' :
                  product.stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {product.stockStatus.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={optimizedCardVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
      style={{ willChange: 'transform, opacity' }} // Optimize for animation
    >
      <Card
        className="h-full hover:shadow-xl transition-shadow duration-200 cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative">
          <LazyImage
            src={product.images[0]}
            alt={product.name}
            className="w-full h-36 sm:h-40 md:h-48"
            width={400}
            height={300}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            priority={index !== undefined && index < 6} // Prioritize first 6 images
            loading={index !== undefined && index < 6 ? 'eager' : 'lazy'}
          />

          {product.isLimitedEdition && (
            <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-accent-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
              Limited Edition
            </span>
          )}

          {savings > 0 && (
            <span className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-green-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
              Save Rs.{savings}
            </span>
          )}

          {/* Save/Unsave Button */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className={`absolute bottom-2 right-2 p-2 rounded-full shadow-md transition-all ${
              isSaved
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
            aria-label={isSaved ? 'Remove from saved deals' : 'Save deal'}
            title={isSaved ? 'Remove from saved deals' : 'Save deal'}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg text-neutral-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center mb-2 sm:mb-3">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-xs sm:text-sm text-neutral-600">
              {product.averageRating} ({product.totalReviews})
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              {bestOffer ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary-600">
                    Rs.{bestOffer.price.toLocaleString()}
                  </span>
                  {savings > 0 && (
                    <span className="text-sm text-neutral-500 line-through">
                      Rs.{product.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-2xl font-bold text-neutral-900">
                  Rs.{product.basePrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.stockStatus === 'in-stock' ? 'bg-green-100 text-green-700' :
              product.stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {product.stockStatus.replace('-', ' ')}
            </div>
          </div>

          {seller && (
            <div className="text-sm text-neutral-600">
              Best offer from <span className="font-medium">{seller.name}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;
