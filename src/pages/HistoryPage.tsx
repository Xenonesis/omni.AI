import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const HistoryPage: React.FC = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <Button
              variant="primary"
              icon={<Search size={18} />}
              onClick={() => navigate('/search')}
            >
              New Search
            </Button>
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
                onClick={() => navigate('/search')}
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
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center text-xs text-neutral-500 mr-3">
                            <Clock size={14} className="mr-1" />
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                        <h3 className="font-medium text-neutral-800 mb-1">{item.query}</h3>

                        {item.recommendations && item.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-neutral-100">
                            <p className="text-sm text-neutral-600 mb-2">Top deal:</p>
                            <div className="flex justify-between items-center text-sm">
                              <span>{item.recommendations[0].offer.sellerName}</span>
                              <span className="font-semibold">${item.recommendations[0].offer.price}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600"
                        icon={<ChevronRight size={18} />}
                        onClick={() => navigate('/marketplace')}
                      >
                        Repeat
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryPage;