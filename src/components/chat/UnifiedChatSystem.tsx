import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bot, Sparkles, X } from 'lucide-react';
import { openOmniDimensionWidget, waitForOmniDimensionWidget } from '../../utils/omniDimensionWidget';
// import { useChatBot } from '../../context/ChatBotContext';
// import OmniverseChatBot from './OmniverseChatBot';

interface UnifiedChatSystemProps {
  className?: string;
}

const UnifiedChatSystem: React.FC<UnifiedChatSystemProps> = ({ className = '' }) => {
  const [omniDimensionAvailable, setOmniDimensionAvailable] = useState(false);
  const [isCheckingWidget, setIsCheckingWidget] = useState(true);
  // const [showFallbackChat, setShowFallbackChat] = useState(false);
  // const { state: chatState, openChat, closeChat } = useChatBot();

  // Check for OmniDimension widget availability
  useEffect(() => {
    const checkOmniDimensionWidget = async () => {
      setIsCheckingWidget(true);

      try {
        // Wait for widget to load (up to 10 seconds)
        const available = await waitForOmniDimensionWidget(10000);
        setOmniDimensionAvailable(available);

        if (!available) {
          console.log('🤖 OmniDimension widget not available, using fallback chat');
        } else {
          console.log('🤖 OmniDimension widget is available');
        }
      } catch (error) {
        console.error('🤖 Error checking OmniDimension widget:', error);
        setOmniDimensionAvailable(false);
      } finally {
        setIsCheckingWidget(false);
      }
    };

    checkOmniDimensionWidget();

    // Re-check periodically in case widget loads later
    const interval = setInterval(() => {
      if (!omniDimensionAvailable) {
        // Check for widget script and global objects
        const widgetScript = document.getElementById('omnidimension-web-widget');
        const hasWidget = !!(
          widgetScript ||
          window.OmniDimensionWidget ||
          window.omnidim ||
          document.querySelector('[data-omnidim-widget]') ||
          document.querySelector('iframe[src*="omnidim"]')
        );

        if (hasWidget) {
          setOmniDimensionAvailable(true);
          console.log('🤖 OmniDimension widget became available');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [omniDimensionAvailable]);

  const handleChatButtonClick = async () => {
    console.log('🤖 OmniDimension chat button clicked');

    if (omniDimensionAvailable) {
      // Try to open OmniDimension widget
      try {
        const success = openOmniDimensionWidget();
        if (success) {
          console.log('🤖 OmniDimension widget opened successfully');
          return;
        }
      } catch (error) {
        console.error('🤖 Error opening OmniDimension widget:', error);
      }
    } else {
      console.log('🤖 OmniDimension widget not available');
      alert('OmniDimension widget is not available. Please refresh the page or check your connection.');
    }

    // // Fallback to custom chat (commented out)
    // console.log('🤖 Using fallback custom chat');
    // setShowFallbackChat(true);
    // openChat();
  };

  // // Hide custom chat when OmniDimension is available and working (commented out)
  // const shouldShowCustomChat = showFallbackChat && (!omniDimensionAvailable || chatState.isOpen);

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Main Chat Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <motion.button
          onClick={handleChatButtonClick}
          disabled={isCheckingWidget}
          className={`chat-button group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-full shadow-2xl flex items-center space-x-3 transition-all duration-300 hover:shadow-3xl border-2 border-white/20 ${
            isCheckingWidget ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:scale-105'
          }`}
          whileHover={!isCheckingWidget ? { scale: 1.05, y: -3 } : {}}
          whileTap={!isCheckingWidget ? { scale: 0.95 } : {}}
          style={{
            pointerEvents: 'auto',
            userSelect: 'none',
            touchAction: 'manipulation'
          }}
        >
          {/* Bot Icon with Status Indicator */}
          <div className="relative">
            <Bot className="w-6 h-6" />
            <motion.div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isCheckingWidget
                  ? 'bg-yellow-400'
                  : omniDimensionAvailable
                    ? 'bg-green-400'
                    : 'bg-orange-400'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Text */}
          <div className="text-content flex flex-col items-start">
            <span className="font-bold text-sm leading-tight">
              OmniDimension
            </span>
            <span className="font-medium text-xs opacity-90 leading-tight">
              {isCheckingWidget ? 'Loading...' : omniDimensionAvailable ? 'Chat Bot' : 'Unavailable'}
            </span>
          </div>

          {/* Sparkles */}
          <Sparkles className="w-5 h-5 text-yellow-300 group-hover:text-yellow-200" />

          {/* Pulse Ring */}
          {!isCheckingWidget && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 pointer-events-none"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -left-2 bg-white rounded-full px-2 py-1 shadow-lg"
        >
          <span className={`text-xs font-bold ${
            isCheckingWidget
              ? 'text-yellow-600'
              : omniDimensionAvailable
                ? 'text-green-600'
                : 'text-red-600'
          }`}>
            {isCheckingWidget ? '⏳' : omniDimensionAvailable ? '✅' : '❌'}
          </span>
        </motion.div>
      </motion.div>

      {/* Custom Chat Fallback (commented out) */}
      {/* <AnimatePresence>
        {shouldShowCustomChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0"
          >
            <OmniverseChatBot />
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Mobile-friendly touch target */}
      <style jsx>{`
        @media (max-width: 768px) {
          .chat-button {
            min-height: 56px;
            min-width: 200px;
            padding: 12px 20px;
          }
          .chat-button .text-content {
            font-size: 14px;
          }
        }
        @media (max-width: 480px) {
          .chat-button {
            min-width: 180px;
            padding: 10px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default UnifiedChatSystem;
