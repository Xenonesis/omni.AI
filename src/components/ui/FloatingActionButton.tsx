import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowUp, MessageCircle, HelpCircle, Bot, Sparkles } from 'lucide-react';
// import { useChatBot } from '../../context/ChatBotContext';
import { openOmniDimensionWidget, waitForOmniDimensionWidget } from '../../utils/omniDimensionWidget';

interface FloatingActionButtonProps {
  onVoiceSearch: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onVoiceSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // const { openChat, state } = useChatBot();

  // Function to trigger OmniDimension widget
  const openOmniDimensionChat = async () => {
    try {
      console.log('🤖 Chat button clicked! Attempting to open OmniDimension chat widget...');

      // Try to open the widget immediately
      if (openOmniDimensionWidget()) {
        console.log('🤖 OmniDimension widget opened successfully');
        return;
      }

      // If immediate attempt fails, wait for widget to load
      console.log('🤖 Widget not ready, waiting for it to load...');
      const success = await waitForOmniDimensionWidget(5000);

      if (!success) {
        console.log('🤖 OmniDimension widget not available');
        alert('OmniDimension widget is not available. Please refresh the page or check your connection.');
        // openChat();
      }
    } catch (error) {
      console.error('🤖 Error opening OmniDimension widget:', error);
      alert('Error opening OmniDimension widget. Please try again.');
      // Fallback to our custom chat
      // openChat();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actions = [
    {
      icon: <Mic className="w-5 h-5" />,
      label: 'Voice Search',
      onClick: onVoiceSearch,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'OmniDimension Chat Bot',
      onClick: () => {
        openOmniDimensionChat();
        setIsExpanded(false);
      },
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help',
      onClick: () => console.log('Open help'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="mb-4 w-12 h-12 bg-neutral-800 hover:bg-neutral-900 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Prominent Chat Button */}
      {/* {!state.isOpen && ( */}
      {true && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          className="relative"
        >
          <motion.button
            onClick={openOmniDimensionChat}
            className="group relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-full shadow-xl flex items-center space-x-3 transition-all duration-300 hover:shadow-2xl cursor-pointer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-semibold text-sm">OmniDimension Chat Bot</span>
            <Sparkles className="w-4 h-4 text-yellow-300 group-hover:text-yellow-200" />
          </motion.button>

          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-30 pointer-events-none -z-10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
      {/* )} */}

      {/* Action buttons */}
      <div className="relative">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { delay: index * 0.1 }
                  }}
                  exit={{
                    opacity: 0,
                    y: 20,
                    scale: 0.8,
                    transition: { delay: (actions.length - index - 1) * 0.05 }
                  }}
                  className="flex items-center"
                >
                  <span className="bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm font-medium mr-3 shadow-lg whitespace-nowrap">
                    {action.label}
                  </span>
                  <motion.button
                    onClick={action.onClick}
                    className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg flex items-center justify-center transition-colors`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {action.icon}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-full shadow-xl flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isExpanded ? 45 : 0 }}
        >
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: isExpanded ? 2 : 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <div className="w-6 h-0.5 bg-white" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </motion.div>
        </motion.button>

        {/* Pulse animation when not expanded */}
        {!isExpanded && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FloatingActionButton;
