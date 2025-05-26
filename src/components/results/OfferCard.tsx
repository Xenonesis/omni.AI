import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Package, ArrowUpRight, BookmarkPlus, ExternalLink } from 'lucide-react';
import { Offer } from '../../types';
import { SellerOffer } from '../../types/marketplace';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

// Create a flexible offer type that can handle both Offer and SellerOffer
type FlexibleOffer = Offer & Partial<SellerOffer> & {
  // Additional properties that might be in saved deals
  rating?: number;
  deliveryTime?: string;
  stockQuantity?: number;
  productName?: string;
  imageUrl?: string;
  productUrl?: string;
  inStock?: boolean;
  shippingCost?: number;
  originalPrice?: number;
  // Ensure we have productId for navigation
  productId?: string;
};

interface OfferCardProps {
  offer: FlexibleOffer;
  rank?: number;
  showDetailedScores?: boolean;
  scores?: {
    priceScore: number;
    deliveryScore: number;
    reputationScore: number;
    returnPolicyScore: number;
    totalScore: number;
  };
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  rank,
  showDetailedScores = false,
  scores
}) => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSaveDeal = () => {
    if (scores) {
      dispatch({
        type: 'SAVE_DEAL',
        payload: {
          offer,
          totalScore: scores.totalScore,
          priceScore: scores.priceScore,
          deliveryScore: scores.deliveryScore,
          reputationScore: scores.reputationScore,
          returnPolicyScore: scores.returnPolicyScore
        }
      });
    }
  };

  const handleViewDeal = async () => {
    try {
      setIsNavigating(true);

      // Determine the navigation URL based on available data
      let targetUrl: string;
      let navigationMethod: string;

      if (offer.productUrl && offer.productUrl.startsWith('/product/')) {
        // If we have a direct product URL (from saved deals), use it
        targetUrl = offer.productUrl;
        navigationMethod = 'productUrl';
      } else if (offer.productId) {
        // If we have a product ID, navigate to the product details page
        targetUrl = `/product/${offer.productId}`;
        navigationMethod = 'productId';
      } else if (offer.id && offer.id.startsWith('product_')) {
        // If the offer ID looks like a product ID, use it
        targetUrl = `/product/${offer.id}`;
        navigationMethod = 'offerId';
      } else if (offer.id) {
        // Try to use the offer ID as product ID (fallback)
        targetUrl = `/product/${offer.id}`;
        navigationMethod = 'offerId_fallback';
      } else {
        // Last resort: navigate to marketplace with search
        const searchQuery = offer.productName || offer.sellerName || 'products';
        targetUrl = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
        navigationMethod = 'search_fallback';
      }

      console.log(`Navigating via ${navigationMethod} to:`, targetUrl);

      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate to the determined URL
      navigate(targetUrl);

    } catch (error) {
      console.error('Navigation error:', error);
      // Show user-friendly error message
      alert('Unable to view deal details. Redirecting to marketplace...');
      // Fallback to marketplace if navigation fails
      navigate('/marketplace');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <Card
      variant="default"
      className={`relative ${rank === 1 ? 'border-2 border-primary-500' : ''}`}
    >
      {rank && rank <= 3 && (
        <div className={`
          absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
          ${rank === 1 ? 'bg-primary-600' : rank === 2 ? 'bg-accent-600' : 'bg-accent-500'}
        `}>
          {rank}
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            {offer.sellerLogo ? (
              <img
                src={offer.sellerLogo}
                alt={offer.sellerName}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-neutral-200 rounded-full mr-2 flex items-center justify-center">
                <span className="text-neutral-600 text-xs font-medium">
                  {offer.sellerName.substring(0, 2)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-neutral-800 font-medium">{offer.sellerName}</h3>
              <div className="flex items-center">
                <Star className="w-3 h-3 text-warning-400 mr-1" fill="currentColor" />
                <span className="text-xs text-neutral-600">
                  {(offer.reputationScore || offer.rating || 4.5).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold text-neutral-900">
              Rs.{offer.price.toLocaleString()}
            </span>
            <div className="text-xs text-neutral-500">
              {(offer.stock || offer.stockQuantity || 0) > 5
                ? 'In Stock'
                : (offer.stock || offer.stockQuantity || 0) > 0
                  ? `Only ${offer.stock || offer.stockQuantity} left`
                  : 'Out of Stock'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-neutral-400 mr-2" />
            <span className="text-sm text-neutral-700">
              {(offer.estimatedDeliveryDays || offer.deliveryTime || '2-3 days').toString().includes('day')
                ? offer.deliveryTime || `${offer.estimatedDeliveryDays} days delivery`
                : offer.estimatedDeliveryDays === 1
                  ? '1 day delivery'
                  : `${offer.estimatedDeliveryDays || 3} days delivery`}
            </span>
          </div>
          <div className="flex items-center">
            <Package className="w-4 h-4 text-neutral-400 mr-2" />
            <span className="text-sm text-neutral-700">
              {offer.returnPolicy || (offer.returnPolicy?.returnWindow ? `${offer.returnPolicy.returnWindow} days` : '30 days')}
            </span>
          </div>
        </div>

        {showDetailedScores && scores && (
          <div className="bg-neutral-50 p-3 rounded-md mb-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-2">Score Breakdown</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Price</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.priceScore.toFixed(1)}/40</span>
                </div>
                <ProgressBar
                  value={scores.priceScore}
                  max={40}
                  color="success"
                  size="md"
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Delivery</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.deliveryScore.toFixed(1)}/25</span>
                </div>
                <ProgressBar
                  value={scores.deliveryScore}
                  max={25}
                  color="primary"
                  size="md"
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Reputation</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.reputationScore.toFixed(1)}/20</span>
                </div>
                <ProgressBar
                  value={scores.reputationScore}
                  max={20}
                  color="accent"
                  size="md"
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Return Policy</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.returnPolicyScore.toFixed(1)}/15</span>
                </div>
                <ProgressBar
                  value={scores.returnPolicyScore}
                  max={15}
                  color="warning"
                  size="md"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-700">Total Score</span>
                <span className="text-sm font-bold text-primary-700">{scores.totalScore.toFixed(1)}/100</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<BookmarkPlus size={16} />}
            className="flex-1"
            onClick={handleSaveDeal}
          >
            Save
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={isNavigating ? undefined : <ArrowUpRight size={16} />}
            className="flex-1"
            onClick={handleViewDeal}
            disabled={isNavigating}
            aria-label={`View deal for ${offer.productName || offer.sellerName || 'product'}`}
          >
            {isNavigating ? 'Loading...' : 'View Deal'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OfferCard;