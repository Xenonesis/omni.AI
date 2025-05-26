import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  MessageSquare,
  Search,
  ShoppingCart,
  Filter,
  Navigation,
  Sparkles,
  Mic
} from 'lucide-react';
import Button from '../ui/Button';

interface DemoStep {
  id: number;
  title: string;
  userQuery: string;
  aiResponse: string;
  intent: 'search' | 'filter' | 'compare' | 'navigate' | 'help';
  features: string[];
  duration: number;
}

const demoSteps: DemoStep[] = [
  {
    id: 1,
    title: "Natural Language Search",
    userQuery: "Find me wireless headphones under $200 with good bass",
    aiResponse: "I found 12 wireless headphones under $200 with excellent bass response. Here are the top 3 options with the best deals and customer reviews.",
    intent: 'search',
    features: ['NLP Processing', 'Price Filtering', 'Feature Recognition'],
    duration: 4000,
  },
  {
    id: 2,
    title: "Intelligent Filtering",
    userQuery: "Show me only the ones with noise cancellation",
    aiResponse: "Filtering to show only noise-canceling options. I found 5 models that match your criteria. The Sony WH-1000XM4 has the best noise cancellation in your price range.",
    intent: 'filter',
    features: ['Context Awareness', 'Smart Filtering', 'Recommendations'],
    duration: 3500,
  },
  {
    id: 3,
    title: "Product Comparison",
    userQuery: "Compare the top 2 options for me",
    aiResponse: "Comparing Sony WH-1000XM4 vs Bose QuietComfort 45. Sony has better battery life (30hrs vs 24hrs) and superior bass. Bose has more comfortable fit and better call quality.",
    intent: 'compare',
    features: ['Detailed Analysis', 'Feature Comparison', 'Pros & Cons'],
    duration: 4500,
  },
  {
    id: 4,
    title: "Voice Navigation",
    userQuery: "Add the Sony to my cart and go to checkout",
    aiResponse: "Added Sony WH-1000XM4 to your cart. Navigating to checkout page. Would you like me to help you with shipping options?",
    intent: 'navigate',
    features: ['Voice Commands', 'Cart Management', 'Page Navigation'],
    duration: 3000,
  },
  {
    id: 5,
    title: "Conversational Help",
    userQuery: "What other voice commands can I use?",
    aiResponse: "I can help you search products, compare prices, filter results, navigate pages, manage your cart, and answer questions. Try saying 'find deals on laptops' or 'go to my orders'.",
    intent: 'help',
    features: ['Help System', 'Command Discovery', 'User Guidance'],
    duration: 4000,
  },
];

interface VoiceSearchDemoProps {
  autoPlay?: boolean;
  showControls?: boolean;
  reducedMotion?: boolean;
}

const VoiceSearchDemo: React.FC<VoiceSearchDemoProps> = ({
  autoPlay = false,
  showControls = true,
  reducedMotion = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const step = demoSteps[currentStep];
    let timeouts: NodeJS.Timeout[] = [];

    // Start listening animation
    setIsListening(true);
    setIsProcessing(false);
    setShowResponse(false);

    // Show processing after 1 second
    timeouts.push(setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);
    }, 1000));

    // Show response after 2 seconds
    timeouts.push(setTimeout(() => {
      setIsProcessing(false);
      setShowResponse(true);
    }, 2000));

    // Move to next step
    timeouts.push(setTimeout(() => {
      const nextStep = (currentStep + 1) % demoSteps.length;
      setCurrentStep(nextStep);
      setShowResponse(false);
    }, step.duration));

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [currentStep, isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsListening(false);
    setIsProcessing(false);
    setShowResponse(false);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
    setShowResponse(true);
    setIsListening(false);
    setIsProcessing(false);
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'search': return <Search size={16} />;
      case 'filter': return <Filter size={16} />;
      case 'compare': return <MessageSquare size={16} />;
      case 'navigate': return <Navigation size={16} />;
      case 'help': return <Sparkles size={16} />;
      default: return <Mic size={16} />;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'search': return 'bg-blue-100 text-blue-700';
      case 'filter': return 'bg-purple-100 text-purple-700';
      case 'compare': return 'bg-green-100 text-green-700';
      case 'navigate': return 'bg-orange-100 text-orange-700';
      case 'help': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="voice-search-demo bg-white rounded-xl shadow-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            AI Voice Search Demo
          </h3>
          <p className="text-sm text-gray-600">
            Experience intelligent voice shopping with natural language processing
          </p>
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="sm"
              icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              icon={<RotateCcw size={16} />}
            >
              Reset
            </Button>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-2 mb-6">
        {demoSteps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => handleStepClick(index)}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'bg-blue-500'
                : index < currentStep
                ? 'bg-blue-300'
                : 'bg-gray-200'
            }`}
            title={step.title}
          />
        ))}
      </div>

      {/* Current Step Info */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`p-2 rounded-lg ${getIntentColor(currentStepData.intent)}`}>
            {getIntentIcon(currentStepData.intent)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{currentStepData.title}</h4>
            <p className="text-sm text-gray-600 capitalize">{currentStepData.intent} Intent</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentStepData.features.map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Demo Visualization */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6 min-h-[300px]">
        {/* Voice Interface */}
        <div className="text-center mb-6">
          <motion.div
            animate={isListening ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 20px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0)"
              ]
            } : {}}
            transition={{ duration: reducedMotion ? 0 : 1.5, repeat: isListening ? Infinity : 0 }}
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white ${
              isListening ? 'bg-red-500' : isProcessing ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
          >
            {isProcessing ? (
              <motion.div
                animate={reducedMotion ? {} : { rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Mic size={24} />
            )}
          </motion.div>

          <p className="mt-3 text-sm text-gray-600">
            {isListening ? 'Listening...' :
             isProcessing ? 'Processing...' :
             'Ready for voice input'}
          </p>
        </div>

        {/* User Query */}
        <AnimatePresence mode="wait">
          {(isListening || showResponse) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">You said:</p>
                    <p className="text-gray-900">"{currentStepData.userQuery}"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response */}
        <AnimatePresence mode="wait">
          {showResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-500">AI Assistant:</p>
                      <button
                        type="button"
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                        title="Read aloud"
                        aria-label="Read response aloud"
                      >
                        <Volume2 size={14} className="text-gray-400" />
                      </button>
                    </div>
                    <p className="text-gray-900">{currentStepData.aiResponse}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {demoSteps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => handleStepClick(index)}
            className={`p-3 rounded-lg text-left transition-all duration-200 ${
              index === currentStep
                ? 'bg-blue-100 border-2 border-blue-300'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className={`p-1 rounded ${getIntentColor(step.intent)}`}>
                {getIntentIcon(step.intent)}
              </div>
              <span className="text-xs font-medium text-gray-900">
                Step {step.id}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {step.title}
            </p>
          </button>
        ))}
      </div>

      {/* Features Highlight */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-gray-900 mb-2">Key Features Demonstrated:</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Search size={14} className="text-blue-500" />
            <span>Natural Language Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare size={14} className="text-green-500" />
            <span>Conversational AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Navigation size={14} className="text-orange-500" />
            <span>Voice Navigation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 size={14} className="text-purple-500" />
            <span>Text-to-Speech</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSearchDemo;
