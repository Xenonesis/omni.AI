import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookmarkCheck, Search, Trash2, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import OfferCard from '../components/results/OfferCard';

const SavedDealsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Debug: Log the saved deals state
  console.log('💾 Saved Deals Debug:', {
    savedDealsLength: state.savedDeals.length,
    savedDeals: state.savedDeals,
    fullState: state
  });

  const handleRemoveSavedDeal = (id: string) => {
    dispatch({ type: 'REMOVE_SAVED_DEAL', payload: id });
  };

  const handleClearAllDeals = () => {
    dispatch({ type: 'CLEAR_SAVED_DEALS' });
    setShowClearConfirm(false);
  };

  // Test function to add a sample saved deal
  const addTestSavedDeal = () => {
    console.log('🧪 Adding test saved deal...');
    const testDeal = {
      offer: {
        id: 'test-saved-deal-1',
        sellerId: 'test-seller-1',
        sellerName: 'Test Electronics Store',
        productId: 'test-saved-deal-1',
        price: 15999,
        currency: 'INR',
        stock: 10,
        estimatedDeliveryDays: 2,
        reputationScore: 4.5,
        returnPolicy: '30 days',
        // Extended properties for display
        productName: 'Test iPhone 15 Pro',
        originalPrice: 18999,
        rating: 4.5,
        deliveryTime: '2 days',
        shippingCost: 0,
        inStock: true,
        imageUrl: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro',
        productUrl: '/product/test-saved-deal-1',
      },
      totalScore: 90,
      priceScore: 85,
      deliveryScore: 95,
      reputationScore: 90,
      returnPolicyScore: 95,
    };
    dispatch({ type: 'SAVE_DEAL', payload: testDeal });
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
            <div className="flex items-center gap-3">
              {state.savedDeals.length > 0 && (
                <Button
                  variant="outline"
                  icon={<Trash2 size={16} />}
                  onClick={() => setShowClearConfirm(true)}
                  className="text-error-600 border-error-200 hover:bg-error-50"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                onClick={addTestSavedDeal}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Add Test Deal
              </Button>
              <Button
                variant="primary"
                icon={<Search size={18} />}
                onClick={() => navigate('/marketplace')}
              >
                New Search
              </Button>
            </div>
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
                onClick={() => navigate('/marketplace')}
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
                    type="button"
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

          {/* Clear Confirmation Modal */}
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Clear All Saved Deals</h3>
                <p className="text-neutral-600 mb-6">
                  Are you sure you want to remove all saved deals? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleClearAllDeals}
                    className="bg-error-600 hover:bg-error-700"
                  >
                    Clear All
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedDealsPage;