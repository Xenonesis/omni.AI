import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Settings, Clock, BookmarkCheck, Store, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchContext } from '../../context/SearchContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { state: searchState, dispatch } = useSearchContext();

  const handleStartSearch = () => {
    dispatch({ type: 'START_LISTENING' });
    navigate('/marketplace');
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            <span className="text-primary-800 font-bold text-xl md:text-2xl">OmniDimension</span>
            <span className="text-accent-600 font-light text-xl md:text-2xl ml-1">AI</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => navigate('/marketplace')}
            className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Marketplace"
          >
            <Store size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/history')}
            className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Search History"
          >
            <Clock size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/saved')}
            className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Saved Deals"
          >
            <BookmarkCheck size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartSearch}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              ${searchState.status === 'listening'
                ? 'bg-error-500 text-white'
                : 'bg-primary-600 text-white'
              }
              shadow-md hover:shadow-lg transition-all
            `}
            disabled={searchState.status === 'processing'}
            aria-label="Voice Search"
          >
            <Mic size={18} />
            <span className="hidden md:inline">
              {searchState.status === 'listening' ? 'Listening...' : 'Voice Search'}
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;