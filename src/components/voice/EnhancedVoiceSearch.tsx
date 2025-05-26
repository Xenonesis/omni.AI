import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader,
  MessageCircle,
  Sparkles,
  Brain,
  Zap,
  Activity
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { nlpService, ParsedQuery } from '../../services/nlpService';
import { conversationEngine, AIResponse } from '../../services/conversationEngine';
import { useMarketplace } from '../../context/MarketplaceContext';
import Button from '../ui/Button';
import MicrophoneTestModal from '../debug/MicrophoneTestModal';
import { callVoiceAgentAPI } from '../../services/voiceAgentApi';
import { apiConnection } from '../../services/apiConnection';

interface EnhancedVoiceSearchProps {
  onSearchResults?: (results: any) => void;
  onNavigate?: (destination: string) => void;
  className?: string;
  autoSpeak?: boolean;
  showTranscript?: boolean;
  showConfidence?: boolean;
  reducedMotion?: boolean;
}

const EnhancedVoiceSearch: React.FC<EnhancedVoiceSearchProps> = ({
  onSearchResults,
  onNavigate,
  className = '',
  autoSpeak = true,
  showTranscript = true,
  showConfidence = false,
  reducedMotion = false,
}) => {
  const { searchProducts } = useMarketplace();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [showMicTest, setShowMicTest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai';
    text: string;
    timestamp: number;
  }>>([]);

  // Enhanced agentic capabilities
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [agentThinking, setAgentThinking] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [conversationContext, setConversationContext] = useState<any>(null);
  const [agentPersonality, setAgentPersonality] = useState('helpful');
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(true);
  const [continuousConversation, setContinuousConversation] = useState(false);
  const [lastAgentResponse, setLastAgentResponse] = useState<string>('');
  const [thinkingDots, setThinkingDots] = useState('');
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'responding' | 'searching'>('idle');
  const [realTimeTranscript, setRealTimeTranscript] = useState('');
  const [agentMemory, setAgentMemory] = useState<Array<{query: string, response: string, context: any}>>([]);

  const processingTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionIdRef = useRef<string>('');
  const thinkingIntervalRef = useRef<NodeJS.Timeout>();
  const continuousListeningRef = useRef<boolean>(false);

  // Clean transcript function to remove unwanted punctuation
  const cleanTranscript = useCallback((text: string): string => {
    if (!text) return '';

    return text
      // Remove trailing periods, commas, and other punctuation
      .replace(/[.,!?;:]+$/g, '')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Convert to lowercase for consistency
      .toLowerCase()
      // Remove any remaining unwanted characters but keep essential ones
      .replace(/[^\w\s\-']/g, '')
      // Clean up any double spaces that might have been created
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
    if (!voiceService.isSupported()) {
      setError('Voice search is not supported in your browser. Please use Chrome or Edge.');
    }

    // Start conversation session
    sessionIdRef.current = conversationEngine.startSession();

    // Initialize agentic capabilities
    initializeAgent();

    // Monitor API connection status
    const checkApiStatus = () => {
      const status = apiConnection.getStatus();
      setApiConnectionStatus(status.isConnected ? 'connected' : 'disconnected');
    };

    checkApiStatus();
    const statusInterval = setInterval(checkApiStatus, 5000);

    return () => {
      voiceService.cleanup();
      conversationEngine.endSession();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
      clearInterval(statusInterval);
    };
  }, []);

  // Initialize agent with enhanced capabilities
  const initializeAgent = useCallback(() => {
    setIsAgentActive(true);
    setAgentState('idle');

    // Set up thinking animation
    const updateThinkingDots = () => {
      setThinkingDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    };

    thinkingIntervalRef.current = setInterval(updateThinkingDots, 500);

    console.log('🤖 Agentic Voice Assistant initialized');
    console.log('🔗 API Status:', apiConnectionStatus);
    console.log('🎯 Real-time mode:', realTimeMode);
  }, [apiConnectionStatus, realTimeMode]);

  const handleVoiceStart = useCallback(() => {
    setIsListening(true);
    setError(null);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const handleVoiceResult = useCallback(async (text: string, isFinal: boolean, confidenceScore: number) => {
    // Clean the text to remove unwanted punctuation and characters
    const cleanedText = cleanTranscript(text);

    if (realTimeMode && !isFinal) {
      // Real-time processing for interim results
      setRealTimeTranscript(cleanedText);
      setInterimTranscript(cleanedText);

      // Process interim results for real-time agent feedback
      if (cleanedText.length > 3) {
        await processRealTimeInput(cleanedText);
      }
      return;
    }

    if (isFinal) {
      setTranscript(cleanedText);
      setInterimTranscript('');
      setRealTimeTranscript('');
      setIsListening(false);
      setAgentState('thinking');
      setAgentThinking(true);
      setIsProcessing(true);
      setConfidence(confidenceScore);

      // Add user message to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'user',
        text: cleanedText,
        timestamp: Date.now(),
      }]);

      console.log('🎤 Processing voice input:', cleanedText);
      console.log('🤖 Agent state: thinking');

      try {
        // Enhanced agentic processing
        await processAgenticInput(cleanedText, confidenceScore);
      } catch (error) {
        setError('Sorry, there was a problem with the voice agent. Please try again.');
        console.error('Voice agent API error:', error);
      } finally {
        setIsProcessing(false);
        setAgentThinking(false);
        setAgentState('idle');
      }
    } else {
      setInterimTranscript(cleanedText);
    }
  }, [cleanTranscript, onSearchResults, onNavigate, realTimeMode]);

  // Process real-time input for immediate agent feedback
  const processRealTimeInput = useCallback(async (text: string) => {
    if (!realTimeMode || !isAgentActive) return;

    try {
      // Quick NLP analysis for real-time feedback
      const parsedQuery = nlpService.parseQuery(text);

      // Update conversation context in real-time
      setConversationContext(prev => ({
        ...prev,
        currentInput: text,
        detectedIntent: parsedQuery.intent,
        confidence: parsedQuery.confidence
      }));

      // Provide real-time visual feedback
      if (parsedQuery.intent !== 'unknown' && parsedQuery.confidence > 0.7) {
        setAgentState('listening');
      }

    } catch (error) {
      console.warn('Real-time processing error:', error);
    }
  }, [realTimeMode, isAgentActive]);

  // Enhanced agentic input processing
  const processAgenticInput = useCallback(async (text: string, confidence: number) => {
    setAgentState('thinking');

    try {
      // Build enhanced context for the agent
      const enhancedContext = {
        transcript: text,
        confidence,
        sessionId: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        conversationHistory: conversationHistory.slice(-5), // Last 5 exchanges
        agentMemory: agentMemory.slice(-3), // Last 3 memory items
        userPreferences: {
          personality: agentPersonality,
          voiceEnabled: voiceResponseEnabled,
          realTimeMode
        },
        apiStatus: apiConnectionStatus,
        context: conversationContext
      };

      console.log('🧠 Enhanced context:', enhancedContext);

      // Call the voice agent API with enhanced context
      const agentResponse = await callVoiceAgentAPI(enhancedContext);

      // Process agent response
      await handleAgentResponse(agentResponse, text);

    } catch (error) {
      console.error('Agentic processing error:', error);
      await handleAgentError(error, text);
    }
  }, [conversationHistory, agentMemory, agentPersonality, voiceResponseEnabled, realTimeMode, apiConnectionStatus, conversationContext]);

  // Handle agent response with enhanced capabilities
  const handleAgentResponse = useCallback(async (response: any, originalQuery: string) => {
    setAgentState('responding');
    setAiResponse(response);
    setLastAgentResponse(response.text || response.message || '');

    // Add to conversation history
    setConversationHistory(prev => [...prev, {
      type: 'ai',
      text: response.text || response.message || '',
      timestamp: Date.now(),
    }]);

    // Add to agent memory
    setAgentMemory(prev => [...prev, {
      query: originalQuery,
      response: response.text || response.message || '',
      context: {
        intent: response.action,
        confidence: response.confidence,
        timestamp: Date.now()
      }
    }].slice(-10)); // Keep last 10 memory items

    // Handle voice response
    if (voiceResponseEnabled && response.shouldSpeak !== false) {
      setAgentState('responding');
      await handleSpeak(response.text || response.message || '');
    }

    // Handle actions
    if (response.action) {
      await handleAgentAction(response);
    }

    // Pass results to parent
    onSearchResults?.(response);

    // Handle continuous conversation
    if (continuousConversation && response.followUpQuestions?.length > 0) {
      setTimeout(() => {
        if (continuousListeningRef.current) {
          startListening();
        }
      }, 2000);
    }

    console.log('🤖 Agent response processed:', response);
  }, [voiceResponseEnabled, continuousConversation, onSearchResults]);

  // Handle agent actions
  const handleAgentAction = useCallback(async (response: any) => {
    switch (response.action) {
      case 'search':
        setAgentState('searching');
        if (response.searchParams) {
          await performSearch(response.searchParams.query || response.searchParams);
        }
        break;
      case 'navigate':
        if (response.navigationTarget) {
          onNavigate?.(response.navigationTarget);
        }
        break;
      case 'filter':
        // Handle filtering logic
        break;
      case 'compare':
        // Handle comparison logic
        break;
      default:
        console.log('Unknown action:', response.action);
    }
    setAgentState('idle');
  }, [onNavigate]);

  // Search products function using marketplace context
  const performSearch = useCallback(async (query: string) => {
    try {
      await searchProducts(query);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [searchProducts]);

  // Handle agent errors with fallback
  const handleAgentError = useCallback(async (error: any, originalQuery: string) => {
    console.error('Agent error:', error);

    // Fallback to local processing
    try {
      const parsedQuery = nlpService.parseQuery(originalQuery);
      const fallbackResponse = conversationEngine.generateResponse(parsedQuery);

      await handleAgentResponse(fallbackResponse, originalQuery);
    } catch (fallbackError) {
      setError('I apologize, but I\'m having trouble processing your request. Please try again.');
      console.error('Fallback error:', fallbackError);
    }
  }, []);

  const handleVoiceError = useCallback((errorMessage: string, suggestions?: string[]) => {
    setError(errorMessage);
    setErrorSuggestions(suggestions || []);
    setIsListening(false);
    setIsProcessing(false);

    // Auto-clear error after 10 seconds
    setTimeout(() => {
      setError(null);
      setErrorSuggestions([]);
    }, 10000);
  }, []);

  const handleVoiceEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) return;

    try {
      await voiceService.startListening({
        onStart: handleVoiceStart,
        onResult: handleVoiceResult,
        onError: handleVoiceError,
        onEnd: handleVoiceEnd,
      });
    } catch (error) {
      setError('Failed to start voice recognition. Please check your microphone permissions.');
    }
  }, [isSupported, handleVoiceStart, handleVoiceResult, handleVoiceError, handleVoiceEnd]);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
  }, []);

  const handleSpeak = useCallback(async (text: string) => {
    if (!isSupported) return;

    try {
      setIsSpeaking(true);
      await voiceService.speak(text);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const stopSpeaking = useCallback(() => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const buildSearchParams = (parsedQuery: ParsedQuery) => {
    const { entities } = parsedQuery;
    return {
      query: entities.product || parsedQuery.originalQuery || transcript,
      category: entities.category,
      brand: entities.brand,
      priceRange: entities.priceRange,
      size: entities.size,
      color: entities.color,
    };
  };

  const getStatusText = () => {
    if (agentThinking) return `Agent is thinking${thinkingDots}`;
    if (agentState === 'searching') return 'Searching products...';
    if (agentState === 'responding') return 'Agent responding...';
    if (isProcessing) return 'Processing your request...';
    if (isListening) return realTimeMode ? 'Listening in real-time...' : 'Listening...';
    if (isSpeaking) return 'Speaking...';
    if (isAgentActive) return 'AI Agent ready - Click to start conversation';
    return 'Click to start voice search';
  };

  const getStatusIcon = () => {
    if (agentThinking) return <Brain className="animate-pulse" size={24} />;
    if (agentState === 'searching') return <Loader className="animate-spin" size={24} />;
    if (agentState === 'responding') return <Activity className="animate-bounce" size={24} />;
    if (isProcessing) return <Loader className="animate-spin" size={24} />;
    if (isListening) return <MicOff size={24} />;
    if (isSpeaking) return <Volume2 size={24} />;
    if (isAgentActive) return <Zap size={24} />;
    return <Mic size={24} />;
  };

  const getAgentStatusColor = () => {
    if (agentThinking) return 'from-purple-600 to-pink-600';
    if (agentState === 'searching') return 'from-blue-600 to-cyan-600';
    if (agentState === 'responding') return 'from-green-600 to-emerald-600';
    if (isListening) return 'from-red-500 to-red-600';
    if (isAgentActive) return 'from-purple-600 to-blue-600';
    return 'from-gray-400 to-gray-500';
  };

  const microphoneAnimation = {
    scale: isListening ? [1, 1.1, 1] : 1,
    boxShadow: isListening ? [
      "0 0 0 0 rgba(59, 130, 246, 0.4)",
      "0 0 0 20px rgba(59, 130, 246, 0)",
      "0 0 0 0 rgba(59, 130, 246, 0)"
    ] : "0 0 0 0 rgba(59, 130, 246, 0)",
  };

  const microphoneTransition = {
    duration: reducedMotion ? 0 : 1.5,
    repeat: isListening ? Infinity : 0,
    ease: "easeInOut",
  };

  if (!isSupported) {
    return (
      <div className={`text-center p-6 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Voice Search Not Supported</h3>
        <p className="text-red-600">
          Your browser doesn't support voice search. Please use Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className={`voice-search-container ${className}`}>
      {/* Main Voice Interface */}
      <div className="text-center mb-4 sm:mb-6">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || agentThinking}
          className={`
            relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-semibold
            transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg touch-target
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
              : isProcessing || agentThinking
                ? 'bg-gray-400 cursor-not-allowed focus:ring-gray-300'
                : `bg-gradient-to-r ${getAgentStatusColor()} hover:shadow-xl focus:ring-purple-300`
            }
          `}
          animate={isListening ? {
            ...microphoneAnimation,
            boxShadow: [
              "0 0 0 0 rgba(239, 68, 68, 0.4)",
              "0 0 0 25px rgba(239, 68, 68, 0)",
              "0 0 0 0 rgba(239, 68, 68, 0)"
            ]
          } : microphoneAnimation}
          transition={{
            ...microphoneTransition,
            boxShadow: {
              duration: 1.5,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut"
            }
          }}
          whileTap={reducedMotion ? {} : { scale: 0.95 }}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic size={window.innerWidth < 640 ? 20 : window.innerWidth < 768 ? 22 : 24} />
            </motion.div>
          ) : (
            getStatusIcon()
          )}
        </motion.button>

        {/* Enhanced Status Display */}
        <motion.div
          className="mt-3 sm:mt-4 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm sm:text-base md:text-lg font-medium text-gray-700 px-2 text-center">
            {getStatusText()}
          </p>

          {/* Agent Status Indicator */}
          {isAgentActive && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                apiConnectionStatus === 'connected' ? 'bg-green-500' :
                apiConnectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-gray-600">
                AI Agent {apiConnectionStatus === 'connected' ? 'Online' :
                         apiConnectionStatus === 'checking' ? 'Connecting...' : 'Offline'}
              </span>
              {realTimeMode && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-purple-600 font-medium">Real-time Mode</span>
                </>
              )}
            </div>
          )}

          {/* Real-time Transcript Preview */}
          {realTimeMode && realTimeTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 border border-purple-200 rounded-lg p-3 max-w-md mx-auto"
            >
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-xs font-medium text-purple-700">Real-time Processing</span>
              </div>
              <p className="text-sm text-gray-700 italic">"{realTimeTranscript}"</p>
            </motion.div>
          )}
        </motion.div>

        {/* Confidence Indicator */}
        {showConfidence && confidence > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-500 mb-1">
              Confidence: {Math.round(confidence * 100)}%
            </div>
            <div className="w-32 mx-auto bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {showTranscript && (transcript || interimTranscript) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-md border mb-4"
        >
          <div className="flex items-start space-x-3">
            <MessageCircle className="text-blue-500 mt-1" size={20} />
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">You said:</p>
              <p className="text-gray-900">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-400 italic">{interimTranscript}</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Response */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 shadow-md border mb-4"
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="text-purple-500 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">AI Assistant:</p>
                <p className="text-gray-900 mb-3">{aiResponse.text}</p>

                {/* Action Suggestions */}
                {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {aiResponse.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleVoiceResult(suggestion, true, 1.0)}
                        className="px-3 py-1 bg-white rounded-full text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Follow-up Questions */}
                {aiResponse.followUpQuestions && aiResponse.followUpQuestions.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">You might also ask:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {aiResponse.followUpQuestions.map((question, index) => (
                        <li key={index} className="cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleVoiceResult(question, true, 1.0)}>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Speak Button */}
              <button
                type="button"
                onClick={() => isSpeaking ? stopSpeaking() : handleSpeak(aiResponse.text)}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-red-500 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium mb-2">{error}</p>

                {/* Error Suggestions */}
                {errorSuggestions.length > 0 && (
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Try these solutions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {errorSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Microphone Test Button */}
                {error.includes('no-speech') || error.includes('microphone') || error.includes('audio') ? (
                  <button
                    type="button"
                    onClick={() => setShowMicTest(true)}
                    className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Test Microphone
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setErrorSuggestions([]);
                }}
                className="text-red-500 hover:text-red-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          size="sm"
          icon={<Settings size={16} />}
        >
          Settings
        </Button>

        {conversationHistory.length > 0 && (
          <Button
            onClick={() => setConversationHistory([])}
            variant="outline"
            size="sm"
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-gray-50 rounded-lg p-4 border"
          >
            <h4 className="font-semibold mb-3">Voice & AI Agent Settings</h4>
            <div className="space-y-4">
              {/* Voice Settings */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Voice Settings</h5>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-speak AI responses</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showTranscript}
                      onChange={(e) => setShowTranscript(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Show transcript</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showConfidence}
                      onChange={(e) => setShowConfidence(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Show confidence score</span>
                  </label>
                </div>
              </div>

              {/* AI Agent Settings */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">AI Agent Settings</h5>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={realTimeMode}
                      onChange={(e) => setRealTimeMode(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Real-time processing</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={voiceResponseEnabled}
                      onChange={(e) => setVoiceResponseEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Voice responses</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={continuousConversation}
                      onChange={(e) => setContinuousConversation(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Continuous conversation</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Agent personality:</span>
                    <select
                      value={agentPersonality}
                      onChange={(e) => setAgentPersonality(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      aria-label="Agent personality"
                    >
                      <option value="helpful">Helpful</option>
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Agent Status */}
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Agent Status</h5>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>State: <span className="font-medium">{agentState}</span></div>
                  <div>Memory: <span className="font-medium">{agentMemory.length} items</span></div>
                  <div>Session: <span className="font-medium">{sessionIdRef.current.slice(-8)}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Microphone Test Modal */}
      <MicrophoneTestModal
        isOpen={showMicTest}
        onClose={() => setShowMicTest(false)}
      />
    </div>
  );
};

export default EnhancedVoiceSearch;
