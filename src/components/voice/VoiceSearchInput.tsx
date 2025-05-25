import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useSearchContext } from '../../context/SearchContext';
import Button from '../ui/Button';

const VoiceSearchInput: React.FC = () => {
  const { state, dispatch } = useSearchContext();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);

        if (final) {
          dispatch({ type: 'SET_QUERY', payload: final });
          if (!autoMode) {
            recognition.stop();
            dispatch({ type: 'START_PROCESSING' });
            
            // Mock product identification
            const mockProduct = {
              id: '1234',
              name: final.split(',')[0],
              brand: final.split(' ')[0],
              category: 'Footwear',
              specifications: [final.split(',')[1] || 'Default Size'],
            };
            
            dispatch({ type: 'SET_PRODUCT', payload: mockProduct });
            
            // Mock offers retrieval
            setTimeout(() => {
              const mockOffers = Array.from({ length: 7 }, (_, i) => ({
                id: `offer-${i}`,
                sellerId: `seller-${i}`,
                sellerName: `Reseller ${i + 1}`,
                sellerLogo: i % 2 === 0 ? 'https://via.placeholder.com/40' : undefined,
                productId: '1234',
                price: Math.round(300 + Math.random() * 700),
                currency: 'USD',
                stock: Math.floor(Math.random() * 10) + 1,
                estimatedDeliveryDays: Math.floor(Math.random() * 14) + 1,
                reputationScore: Math.round((Math.random() * 5) * 10) / 10,
                returnPolicy: i % 3 === 0 ? 'No Returns' : i % 3 === 1 ? '14-day returns' : '30-day returns',
              }));
              
              dispatch({ type: 'SET_OFFERS', payload: mockOffers });
              
              const recommendations = mockOffers.map(offer => {
                const priceScore = 40 * (1 - (offer.price - 300) / 700);
                const deliveryScore = 25 * (1 - (offer.estimatedDeliveryDays - 1) / 14);
                const reputationScore = 20 * (offer.reputationScore / 5);
                const returnPolicyScore = offer.returnPolicy === 'No Returns' 
                  ? 0 
                  : offer.returnPolicy === '14-day returns' 
                    ? 7.5 
                    : 15;
                
                const totalScore = priceScore + deliveryScore + reputationScore + returnPolicyScore;
                
                return {
                  offer,
                  totalScore,
                  priceScore,
                  deliveryScore,
                  reputationScore,
                  returnPolicyScore
                };
              }).sort((a, b) => b.totalScore - a.totalScore);
              
              dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
            }, 1500);
          }
        }
      };

      recognition.onerror = (event) => {
        dispatch({ type: 'SET_ERROR', payload: event.error });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (autoMode && state.status !== 'processing') {
          try {
            recognition.start();
          } catch (error) {
            console.error('Recognition restart error:', error);
          }
        }
      };

      setRecognition(recognition);

      if (autoMode) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Initial recognition error:', error);
        }
      }

      return () => {
        recognition.stop();
      };
    } else {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Speech recognition is not supported in your browser. Please use Chrome.' 
      });
    }
  }, [dispatch, autoMode]);

  const handleToggleMode = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      }
      setAutoMode(!autoMode);
    }
  };

  const handleStartListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Recognition start error:', error);
      }
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    dispatch({ type: 'RESET' });
  };

  const pulseVariants = {
    listening: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
      }
    },
    idle: {
      scale: 1,
      opacity: 1,
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full flex justify-center mb-6">
        <button
          onClick={handleToggleMode}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          {autoMode ? (
            <>
              <ToggleRight className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">Auto Mode</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-neutral-400" />
              <span className="text-sm font-medium">Manual Mode</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        variants={pulseVariants}
        animate={isListening ? 'listening' : 'idle'}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center mb-4
          ${isListening ? 'bg-error-100' : 'bg-neutral-100'}
          ${!autoMode && !isListening ? 'cursor-pointer hover:bg-neutral-200' : ''}
        `}
        onClick={() => !autoMode && handleStartListening()}
      >
        {isListening ? (
          <Mic className="w-12 h-12 text-error-500" />
        ) : (
          <Mic className="w-12 h-12 text-neutral-400" />
        )}
      </motion.div>
      
      <div className="text-center mb-8">
        <h2 className="text-xl font-medium text-neutral-800 mb-2">
          {isListening 
            ? "I'm listening..." 
            : autoMode
              ? "Auto mode active - I'm always listening"
              : "Click the microphone to start"}
        </h2>
        <p className="text-neutral-500 text-sm">
          {isListening 
            ? "Speak clearly and include details like brand, model, size, color" 
            : autoMode
              ? "Just start speaking whenever you're ready"
              : "Click to start voice recognition"}
        </p>
        
        {(interimTranscript || state.query) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg shadow-sm"
          >
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Transcription</h3>
            {interimTranscript && (
              <p className="text-neutral-500 italic mb-2">{interimTranscript}...</p>
            )}
            {state.query && (
              <p className="text-neutral-800 font-medium">{state.query}</p>
            )}
          </motion.div>
        )}
        
        {state.error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-error-100 rounded-lg flex items-center"
          >
            <AlertCircle className="text-error-500 mr-2" size={16} />
            <p className="text-error-700 text-sm">{state.error}</p>
          </motion.div>
        )}
      </div>
      
      {!autoMode && (
        <div className="flex gap-4">
          {isListening ? (
            <Button
              variant="danger"
              icon={<MicOff size={18} />}
              onClick={handleStopListening}
            >
              Stop Listening
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Mic size={18} />}
              onClick={handleStartListening}
              disabled={state.status === 'processing'}
            >
              Start Listening
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSearchInput;