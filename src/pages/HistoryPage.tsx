import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Search, Trash2, MoreVertical } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const HistoryPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // Debug: Log the search history
  console.log('🔍 Search History Debug:', {
    searchHistoryLength: state.searchHistory.length,
    searchHistory: state.searchHistory
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
    setShowClearConfirm(false);
  };

  const handleSearchAgain = (query: string) => {
    navigate(`/marketplace?search=${encodeURIComponent(query)}`);
  };

  // Test function to add a sample search history entry
  const addTestHistory = () => {
    console.log('🧪 Adding test search history entry...');
    dispatch({
      type: 'ADD_SEARCH_HISTORY',
      payload: {
        query: 'Test Nike Shoes',
        product: {
          id: 'test-1',
          name: 'Nike Air Max Test',
          brand: 'Nike',
          category: 'fashion',
          basePrice: 8999,
          images: ['https://via.placeholder.com/300x300?text=Nike+Test'],
          averageRating: 4.5,
          totalReviews: 100,
          stockStatus: 'in-stock',
          tags: ['nike', 'shoes', 'test']
        },
        recommendations: [{
          offer: {
            id: 'test-offer-1',
            productId: 'test-1',
            productName: 'Nike Air Max Test',
            price: 7999,
            originalPrice: 8999,
            sellerName: 'Test Store',
            rating: 4.5,
            deliveryTime: '2-3 days',
            shippingCost: 0,
            returnPolicy: '30 days',
            inStock: true,
            imageUrl: 'https://via.placeholder.com/300x300?text=Nike+Test',
            productUrl: '/product/test-1',
            stockStatus: 'in-stock',
            discount: 1000,
            condition: 'new',
            lastUpdated: new Date().toISOString(),
          },
          totalScore: 90,
          priceScore: 85,
          deliveryScore: 90,
          reputationScore: 90,
          returnPolicyScore: 95,
        }]
      }
    });
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
            <h1 className="text-2xl font-bold text-neutral-800">Search History</h1>
            <div className="flex items-center gap-3">
              {state.searchHistory.length > 0 && (
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
                onClick={addTestHistory}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Add Test History
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

          {state.searchHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-neutral-700 mb-2">No search history yet</h2>
              <p className="text-neutral-500 mb-6">
                Your search history will appear here once you start looking for items.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/marketplace')}
              >
                Start Searching
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {state.searchHistory.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleSearchAgain(item.query)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center text-xs text-neutral-500 mr-3">
                            <Clock size={14} className="mr-1" />
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                        <h3 className="font-medium text-neutral-800 mb-1">{item.query}</h3>

                        {item.recommendations && item.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <p className="text-sm text-neutral-600 mb-2">
                              Found {item.recommendations.length} result{item.recommendations.length !== 1 ? 's' : ''}
                            </p>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-neutral-700">{item.recommendations[0].offer.productName}</span>
                              <span className="font-semibold text-primary-600">
                                Rs.{item.recommendations[0].offer.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSearchAgain(item.query);
                        }}
                        className="flex items-center text-primary-600 hover:text-primary-700 transition-colors ml-4"
                        aria-label="Search again"
                        type="button"
                      >
                        <span className="text-sm mr-1 hidden sm:inline">Search again</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </Card>
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
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Clear Search History</h3>
                <p className="text-neutral-600 mb-6">
                  Are you sure you want to clear all search history? This action cannot be undone.
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
                    onClick={handleClearHistory}
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

export default HistoryPage;