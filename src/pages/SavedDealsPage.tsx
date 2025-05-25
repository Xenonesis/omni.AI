import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookmarkCheck, Search, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import OfferCard from '../components/results/OfferCard';

const SavedDealsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  
  const handleRemoveSavedDeal = (id: string) => {
    dispatch({ type: 'REMOVE_SAVED_DEAL', payload: id });
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">Saved Deals</h1>
            <Button 
              variant="primary" 
              icon={<Search size={18} />}
              onClick={() => navigate('/search')}
            >
              New Search
            </Button>
          </div>
          
          {state.savedDeals.length === 0 ? (
            <Card className="p-8 text-center">
              <BookmarkCheck className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-neutral-700 mb-2">No saved deals yet</h2>
              <p className="text-neutral-500 mb-6">
                Save deals from your search results to keep track of them here.
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate('/search')}
              >
                Start Searching
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.savedDeals.map((deal, index) => (
                <motion.div
                  key={deal.offer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleRemoveSavedDeal(deal.offer.id)}
                    className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1.5 shadow-md text-error-500 hover:text-error-600 transition-colors"
                    aria-label="Remove saved deal"
                  >
                    <Trash2 size={16} />
                  </button>
                  <OfferCard 
                    offer={deal.offer}
                    showDetailedScores={true}
                    scores={{
                      priceScore: deal.priceScore,
                      deliveryScore: deal.deliveryScore,
                      reputationScore: deal.reputationScore,
                      returnPolicyScore: deal.returnPolicyScore,
                      totalScore: deal.totalScore
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedDealsPage;