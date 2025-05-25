import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Package, ArrowUpRight, BookmarkPlus } from 'lucide-react';
import { Offer } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface OfferCardProps {
  offer: Offer;
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
                <span className="text-xs text-neutral-600">{offer.reputationScore.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-neutral-900">
              ${offer.price.toLocaleString()}
            </span>
            <div className="text-xs text-neutral-500">
              {offer.stock > 5 
                ? 'In Stock' 
                : offer.stock > 0 
                  ? `Only ${offer.stock} left` 
                  : 'Out of Stock'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-neutral-400 mr-2" />
            <span className="text-sm text-neutral-700">
              {offer.estimatedDeliveryDays === 1 
                ? '1 day delivery' 
                : `${offer.estimatedDeliveryDays} days delivery`}
            </span>
          </div>
          <div className="flex items-center">
            <Package className="w-4 h-4 text-neutral-400 mr-2" />
            <span className="text-sm text-neutral-700">
              {offer.returnPolicy}
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
                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                  <div className="bg-success-500 h-1.5 rounded-full" style={{ width: `${(scores.priceScore / 40) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Delivery</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.deliveryScore.toFixed(1)}/25</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(scores.deliveryScore / 25) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Reputation</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.reputationScore.toFixed(1)}/20</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                  <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${(scores.reputationScore / 20) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Return Policy</span>
                  <span className="text-xs font-medium text-neutral-700">{scores.returnPolicyScore.toFixed(1)}/15</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1">
                  <div className="bg-warning-500 h-1.5 rounded-full" style={{ width: `${(scores.returnPolicyScore / 15) * 100}%` }}></div>
                </div>
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
            icon={<ArrowUpRight size={16} />}
            className="flex-1"
          >
            View Deal
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OfferCard;