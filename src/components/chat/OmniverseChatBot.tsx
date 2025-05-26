import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Mic,
  MicOff,
  Minimize2,
  Maximize2,
  User,
  Bot,
  Loader,
  Sparkles
} from 'lucide-react';
// import { callChatBotAPI } from '../../services/voiceAgentApi';
import { voiceService } from '../../services/voiceService';
import { useChatBot } from '../../context/ChatBotContext';
// import './ChatBotAnimations.css';

// Custom omniverse.AI Logo Component
const OmniverseLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = ''
}) => (
  <motion.div
    className={`relative ${className}`}
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm"
    >
      {/* Outer ring with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F3F4F6" />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="url(#logoGradient)"
        className="logo-pulse"
      />

      {/* Inner circle */}
      <circle
        cx="20"
        cy="20"
        r="14"
        fill="url(#innerGradient)"
      />

      {/* Central "O" for omniverse */}
      <circle
        cx="20"
        cy="20"
        r="8"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
      />

      {/* AI sparkle effect */}
      <g className="ai-sparkle">
        <circle cx="14" cy="14" r="1" fill="#4F46E5" />
        <circle cx="26" cy="14" r="1" fill="#7C3AED" />
        <circle cx="14" cy="26" r="1" fill="#A855F7" />
        <circle cx="26" cy="26" r="1" fill="#4F46E5" />
      </g>
    </svg>
  </motion.div>
);

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface OmniverseChatBotProps {
  className?: string;
}

const OmniverseChatBot: React.FC<OmniverseChatBotProps> = ({
  className = ''
}) => {
  const { state, toggleChat, toggleMinimize, addMessage, removeTypingMessages, setLoading, setListening } = useChatBot();
  const { isOpen, isMinimized, messages, isLoading, isListening, sessionId } = state;

  const [inputMessage, setInputMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize chat with welcome message (only once per session)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        type: 'bot' as const,
        content: 'Hello! I\'m your fallback chat assistant. The OmniDimension widget is not available, but I can still help you. Please note that for the full OmniDimension experience, the widget should load automatically. How can I assist you today?'
      };

      // Use a timeout to ensure this only runs once
      const timeoutId = setTimeout(() => {
        addMessage(welcomeMessage);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, sessionId, addMessage]); // Use sessionId instead of messages.length

  const sendMessage = async (content: string, isVoice = false) => {
    if (!content.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: content.trim()
    });

    setInputMessage('');
    setLoading(true);

    // Add typing indicator
    addMessage({
      type: 'bot',
      content: '',
      isTyping: true
    });

    try {
      const context = {
        sessionId,
        isVoice,
        previousMessages: messages.slice(-5), // Last 5 messages for context
        timestamp: new Date().toISOString()
      };

      // const response = await callChatBotAPI(content, context);
      const response = { text: 'This chat is disabled. Please use the OmniDimension widget.' };

      // Remove all typing indicators before adding the response
      removeTypingMessages();

      // Add the bot response
      addMessage({
        type: 'bot',
        content: response.text || response.message || response.response || 'I received your message and I\'m here to help.'
      });

      // If voice mode is active, speak the response
      if (isVoice && response.text) {
        try {
          await voiceService.speak(response.text);
        } catch (error) {
          console.error('Text-to-speech error:', error);
        }
      }

    } catch (error) {
      console.error('Chat bot API error:', error);

      // Remove typing indicators on error too
      removeTypingMessages();

      // Add error message
      addMessage({
        type: 'bot',
        content: 'I\'m currently unable to connect to the OmniDimension services. For the best experience, please ensure the OmniDimension widget is loaded, or try refreshing the page.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const startVoiceInput = async () => {
    try {
      setListening(true);
      await voiceService.startListening({
        onStart: () => console.log('Voice input started'),
        onResult: (transcript: string, isFinal: boolean) => {
          if (isFinal) {
            setListening(false);
            sendMessage(transcript, true);
          }
        },
        onError: (error: string) => {
          console.error('Voice input error:', error);
          setListening(false);
        },
        onEnd: () => setListening(false)
      });
    } catch (error) {
      console.error('Failed to start voice input:', error);
      setListening(false);
    }
  };

  const stopVoiceInput = () => {
    voiceService.stopListening();
    setListening(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // OLD BOT UI COMMENTED OUT - Using OmniDimension widget only
  return null;

  /* OLD BOT UI - COMMENTED OUT
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={`bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-custom chat-entrance ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        } flex flex-col minimize-animation overflow-hidden`}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >

        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-4 border-b border-gray-200 header-gradient text-white rounded-t-xl shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <OmniverseLogo size={36} />
            </motion.div>
            <div>
              <motion.h3
                className="font-bold text-sm tracking-wide"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                omniverse.AI
              </motion.h3>
              <motion.div
                className="flex items-center space-x-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles size={10} className="text-yellow-300" />
                <p className="text-xs text-blue-100 font-medium">Smart Shopping Assistant</p>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <motion.button
              type="button"
              onClick={toggleMinimize}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 group"
              title={isMinimized ? "Maximize chat" : "Minimize chat"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMinimized ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMinimized ? <Maximize2 size={16} className="group-hover:text-yellow-300" /> : <Minimize2 size={16} className="group-hover:text-yellow-300" />}
              </motion.div>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => toggleChat(false)}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
              title="Close chat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} className="group-hover:text-red-300" />
            </motion.button>
          </div>
        </motion.div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <motion.div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                          : 'bg-white border border-gray-200/50 text-gray-800 shadow-md'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start space-x-3">
                        <motion.div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user'
                              ? 'bg-white/20 backdrop-blur-sm'
                              : 'bg-gradient-to-r from-primary-100 to-accent-100'
                          }`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {message.type === 'user' ? (
                            <User size={14} className="text-white" />
                          ) : (
                            <Bot size={14} className="text-primary-600" />
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          {message.isTyping ? (
                            <motion.div
                              className="flex items-center space-x-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot-1" />
                                <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot-2" />
                                <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot-3" />
                              </div>
                              <span className="text-xs text-gray-500 ml-2 font-medium">AI is thinking...</span>
                            </motion.div>
                          ) : (
                            <>
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                              <div className="mt-2">
                                <span className={`text-xs ${
                                  message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </motion.div>

            {/* Input */}
            <motion.div
              className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <motion.input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about products..."
                    disabled={isLoading || isListening}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-ring disabled:bg-gray-100 transition-all duration-200 shadow-sm"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                  {isListening && (
                    <motion.div
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <div className="w-3 h-3 bg-red-500 rounded-full voice-pulse" />
                    </motion.div>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  disabled={isLoading}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:shadow-md'
                  } disabled:opacity-50`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={isListening ? "Stop voice input" : "Start voice input"}
                >
                  <motion.div
                    animate={{ rotate: isListening ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </motion.div>
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading || isListening}
                  className="p-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm button-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Send message"
                >
                  <motion.div
                    animate={{ rotate: isLoading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                  >
                    {isLoading ? <Loader size={18} /> : <Send size={18} />}
                  </motion.div>
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
  */
};

export default OmniverseChatBot;
