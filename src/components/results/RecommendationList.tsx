import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Mail, BarChart3 } from 'lucide-react';
import { Recommendation, Product } from '../../types';
import OfferCard from './OfferCard';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

interface RecommendationListProps {
  recommendations: Recommendation[];
  product: Product;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ 
  recommendations, 
  product 
}) => {
  const { dispatch } = useAppContext();
  const [filterBy, setFilterBy] = useState<'best' | 'price' | 'delivery' | 'reputation'>('best');
  const [showEmail, setShowEmail] = useState(false);
  
  const filteredRecommendations = [...recommendations].sort((a, b) => {
    switch (filterBy) {
      case 'price':
        return a.offer.price - b.offer.price;
      case 'delivery':
        return a.offer.estimatedDeliveryDays - b.offer.estimatedDeliveryDays;
      case 'reputation':
        return b.offer.reputationScore - a.offer.reputationScore;
      default:
        return b.totalScore - a.totalScore;
    }
  });
  
  const handleSendEmail = () => {
    // Simulate sending email
    setShowEmail(true);
    setTimeout(() => {
      setShowEmail(false);
      alert('Email report sent successfully!');
    }, 2000);
  };
  
  const handleSaveSearch = () => {
    dispatch({
      type: 'ADD_SEARCH_HISTORY',
      payload: {
        query: product.name,
        product,
        recommendations: recommendations.slice(0, 3),
      }
    });
    alert('Search results saved to history!');
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-5 mb-6"
      >
        <h2 className="text-xl font-bold text-neutral-800 mb-2">
          Results for {product.name}
        </h2>
        <p className="text-neutral-600 mb-4">
          Found {recommendations.length} offers from different resellers
        </p>
        
        <div className="flex flex-wrap gap-3 mb-5">
          <Button 
            variant={filterBy === 'best' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setFilterBy('best')}
          >
            Best Overall
          </Button>
          <Button 
            variant={filterBy === 'price' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setFilterBy('price')}
          >
            Lowest Price
          </Button>
          <Button 
            variant={filterBy === 'delivery' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setFilterBy('delivery')}
          >
            Fastest Delivery
          </Button>
          <Button 
            variant={filterBy === 'reputation' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setFilterBy('reputation')}
          >
            Best Reputation
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              icon={<Filter size={16} />}
            >
              More Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              icon={<BarChart3 size={16} />}
            >
              Compare All
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveSearch}
            >
              Save Results
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              icon={<Mail size={16} />}
              onClick={handleSendEmail}
              disabled={showEmail}
            >
              {showEmail ? 'Sending...' : 'Email Report'}
            </Button>
          </div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredRecommendations.slice(0, 6).map((recommendation, index) => (
          <motion.div
            key={recommendation.offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <OfferCard 
              offer={recommendation.offer} 
              rank={filterBy === 'best' ? index + 1 : undefined} 
              showDetailedScores={index < 3}
              scores={{
                priceScore: recommendation.priceScore,
                deliveryScore: recommendation.deliveryScore,
                reputationScore: recommendation.reputationScore,
                returnPolicyScore: recommendation.returnPolicyScore,
                totalScore: recommendation.totalScore
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;