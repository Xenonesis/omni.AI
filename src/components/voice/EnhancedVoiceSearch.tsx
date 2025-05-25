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
  Sparkles
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { nlpService, ParsedQuery } from '../../services/nlpService';
import { conversationEngine, AIResponse } from '../../services/conversationEngine';
import { useMarketplace } from '../../context/MarketplaceContext';
import Button from '../ui/Button';
import MicrophoneTestModal from '../debug/MicrophoneTestModal';

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

  const processingTimeoutRef = useRef<NodeJS.Timeout>();
  const sessionIdRef = useRef<string>('');

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

    return () => {
      voiceService.cleanup();
      conversationEngine.endSession();
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const handleVoiceStart = useCallback(() => {
    setIsListening(true);
    setError(null);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const handleVoiceResult = useCallback(async (text: string, isFinal: boolean, confidenceScore: number) => {
    // Clean the text to remove unwanted punctuation and characters
    const cleanedText = cleanTranscript(text);

    if (isFinal) {
      setTranscript(cleanedText);
      setInterimTranscript('');
      setIsListening(false);
      setIsProcessing(true);
      setConfidence(confidenceScore);

      // Add user message to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'user',
        text: cleanedText,
        timestamp: Date.now(),
      }]);

      try {
        // Parse the query using NLP
        const parsedQuery: ParsedQuery = nlpService.parseQuery(cleanedText);

        // Handle the query based on intent
        let searchResults = null;
        if (parsedQuery.intent === 'search' || parsedQuery.intent === 'filter') {
          const searchParams = buildSearchParams(parsedQuery);
          searchResults = await searchProducts(searchParams.query, {
            category: searchParams.category,
            priceRange: searchParams.priceRange,
            brand: searchParams.brand,
          });

          // Pass the search parameters to the parent component
          onSearchResults?.({
            query: searchParams.query,
            category: searchParams.category,
            brand: searchParams.brand,
            priceRange: searchParams.priceRange,
            products: searchResults?.products || [],
            results: searchResults
          });
        }

        // Generate AI response
        const response = conversationEngine.generateResponse(parsedQuery, searchResults);
        setAiResponse(response);

        // Add AI response to conversation history
        setConversationHistory(prev => [...prev, {
          type: 'ai',
          text: response.text,
          timestamp: Date.now(),
        }]);

        // Speak the response if enabled
        if (autoSpeak && response.shouldSpeak) {
          await handleSpeak(response.text);
        }

        // Handle navigation if needed
        if (response.action === 'navigate' && response.navigationTarget) {
          onNavigate?.(response.navigationTarget);
        }

      } catch (error) {
        console.error('Voice processing error:', error);
        setError('Sorry, I had trouble processing your request. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setInterimTranscript(cleanedText);
    }
  }, [autoSpeak, onSearchResults, onNavigate, searchProducts]);

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
    if (isProcessing) return 'Processing your request...';
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    return 'Click to start voice search';
  };

  const getStatusIcon = () => {
    if (isProcessing) return <Loader className="animate-spin" size={24} />;
    if (isListening) return <MicOff size={24} />;
    if (isSpeaking) return <Volume2 size={24} />;
    return <Mic size={24} />;
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
      <div className="text-center mb-6">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold
            transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300
            ${isListening
              ? 'bg-red-500 hover:bg-red-600'
              : isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }
          `}
          animate={microphoneAnimation}
          transition={microphoneTransition}
          whileTap={reducedMotion ? {} : { scale: 0.95 }}
        >
          {getStatusIcon()}
        </motion.button>

        <p className="mt-4 text-gray-600 font-medium">
          {getStatusText()}
        </p>

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
            <h4 className="font-semibold mb-3">Voice Settings</h4>
            <div className="space-y-3">
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
