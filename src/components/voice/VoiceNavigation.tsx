import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Navigation, 
  Home, 
  ShoppingCart, 
  Search, 
  Settings, 
  User, 
  Heart,
  Clock,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { nlpService } from '../../services/nlpService';
import { conversationEngine } from '../../services/conversationEngine';

interface VoiceNavigationProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  reducedMotion?: boolean;
}

interface NavigationCommand {
  command: string;
  action: () => void;
  description: string;
  icon: React.ReactNode;
  category: 'navigation' | 'search' | 'interaction' | 'help';
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  isActive,
  onToggle,
  reducedMotion = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [availableCommands, setAvailableCommands] = useState<NavigationCommand[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  // Define navigation commands
  const navigationCommands: NavigationCommand[] = [
    {
      command: 'go home',
      action: () => navigate('/'),
      description: 'Navigate to home page',
      icon: <Home size={16} />,
      category: 'navigation',
    },
    {
      command: 'go to marketplace',
      action: () => navigate('/marketplace'),
      description: 'Browse products in marketplace',
      icon: <Search size={16} />,
      category: 'navigation',
    },
    {
      command: 'open cart',
      action: () => navigate('/orders'),
      description: 'View shopping cart and orders',
      icon: <ShoppingCart size={16} />,
      category: 'navigation',
    },
    {
      command: 'view saved deals',
      action: () => navigate('/saved-deals'),
      description: 'See your saved deals',
      icon: <Heart size={16} />,
      category: 'navigation',
    },
    {
      command: 'search history',
      action: () => navigate('/history'),
      description: 'View search history',
      icon: <Clock size={16} />,
      category: 'navigation',
    },
    {
      command: 'open settings',
      action: () => navigate('/settings'),
      description: 'Access settings and preferences',
      icon: <Settings size={16} />,
      category: 'navigation',
    },
    {
      command: 'voice search',
      action: () => navigate('/voice-shopping'),
      description: 'Start voice shopping',
      icon: <Search size={16} />,
      category: 'search',
    },
    {
      command: 'go back',
      action: () => window.history.back(),
      description: 'Go to previous page',
      icon: <ArrowLeft size={16} />,
      category: 'navigation',
    },
    {
      command: 'go forward',
      action: () => window.history.forward(),
      description: 'Go to next page',
      icon: <ArrowRight size={16} />,
      category: 'navigation',
    },
    {
      command: 'scroll up',
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      description: 'Scroll to top of page',
      icon: <ChevronUp size={16} />,
      category: 'interaction',
    },
    {
      command: 'scroll down',
      action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
      description: 'Scroll to bottom of page',
      icon: <ChevronDown size={16} />,
      category: 'interaction',
    },
    {
      command: 'help',
      action: () => setShowCommands(true),
      description: 'Show available voice commands',
      icon: <HelpCircle size={16} />,
      category: 'help',
    },
  ];

  useEffect(() => {
    setAvailableCommands(navigationCommands);
  }, []);

  useEffect(() => {
    if (isActive && voiceService.isSupported()) {
      startVoiceNavigation();
    } else {
      stopVoiceNavigation();
    }

    return () => {
      stopVoiceNavigation();
    };
  }, [isActive]);

  const startVoiceNavigation = useCallback(async () => {
    try {
      await voiceService.startListening({
        onStart: () => {
          setIsListening(true);
          setCurrentCommand('');
        },
        onResult: handleVoiceCommand,
        onError: (error) => {
          console.error('Voice navigation error:', error);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
          // Restart listening if still active
          if (isActive) {
            setTimeout(() => {
              if (isActive) startVoiceNavigation();
            }, 1000);
          }
        },
      });
    } catch (error) {
      console.error('Failed to start voice navigation:', error);
      onToggle(false);
    }
  }, [isActive, onToggle]);

  const stopVoiceNavigation = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
  }, []);

  const handleVoiceCommand = useCallback(async (transcript: string, isFinal: boolean) => {
    if (!isFinal) {
      setCurrentCommand(transcript);
      return;
    }

    const command = transcript.toLowerCase().trim();
    setCurrentCommand(command);

    // Parse the command using NLP
    const parsedQuery = nlpService.parseQuery(command);
    
    // Find matching navigation command
    const matchingCommand = findMatchingCommand(command);
    
    if (matchingCommand) {
      setLastAction(matchingCommand.description);
      
      // Provide voice feedback
      await voiceService.speak(`${matchingCommand.description}`);
      
      // Execute the command
      setTimeout(() => {
        matchingCommand.action();
      }, 500);
    } else {
      // Handle unrecognized commands
      await handleUnrecognizedCommand(command, parsedQuery);
    }

    // Clear current command after a delay
    setTimeout(() => {
      setCurrentCommand('');
    }, 2000);
  }, []);

  const findMatchingCommand = (command: string): NavigationCommand | null => {
    // Direct command match
    const directMatch = availableCommands.find(cmd => 
      command.includes(cmd.command) || cmd.command.includes(command)
    );
    
    if (directMatch) return directMatch;

    // Fuzzy matching for common variations
    const variations: Record<string, string> = {
      'home': 'go home',
      'cart': 'open cart',
      'basket': 'open cart',
      'shopping': 'open cart',
      'marketplace': 'go to marketplace',
      'products': 'go to marketplace',
      'browse': 'go to marketplace',
      'settings': 'open settings',
      'preferences': 'open settings',
      'saved': 'view saved deals',
      'favorites': 'view saved deals',
      'history': 'search history',
      'previous': 'go back',
      'back': 'go back',
      'forward': 'go forward',
      'next': 'go forward',
      'top': 'scroll up',
      'up': 'scroll up',
      'bottom': 'scroll down',
      'down': 'scroll down',
      'search': 'voice search',
      'find': 'voice search',
      'help': 'help',
      'commands': 'help',
    };

    for (const [variation, actualCommand] of Object.entries(variations)) {
      if (command.includes(variation)) {
        return availableCommands.find(cmd => cmd.command === actualCommand) || null;
      }
    }

    return null;
  };

  const handleUnrecognizedCommand = async (command: string, parsedQuery: any) => {
    // Generate helpful response using conversation engine
    const response = conversationEngine.generateResponse(parsedQuery);
    
    if (response.action === 'navigate' && response.navigationTarget) {
      // Handle navigation intent
      const navCommand = availableCommands.find(cmd => 
        cmd.command.includes(response.navigationTarget!)
      );
      
      if (navCommand) {
        await voiceService.speak(`Navigating to ${response.navigationTarget}`);
        navCommand.action();
        return;
      }
    }

    // Provide helpful feedback
    const suggestions = availableCommands
      .filter(cmd => cmd.category === 'navigation')
      .slice(0, 3)
      .map(cmd => cmd.command)
      .join(', ');

    await voiceService.speak(
      `I didn't understand "${command}". Try saying: ${suggestions}, or say "help" for all commands.`
    );
  };

  const getCurrentPageName = (): string => {
    const pathMap: Record<string, string> = {
      '/': 'Home',
      '/marketplace': 'Marketplace',
      '/voice-shopping': 'Voice Shopping',
      '/orders': 'Orders',
      '/saved-deals': 'Saved Deals',
      '/history': 'Search History',
      '/settings': 'Settings',
    };

    return pathMap[location.pathname] || 'Unknown Page';
  };

  const groupedCommands = availableCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, NavigationCommand[]>);

  return (
    <div className="voice-navigation">
      {/* Voice Navigation Status */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm"
          >
            <div className="flex items-center space-x-3 mb-2">
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                className={`w-3 h-3 rounded-full ${
                  isListening ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              <span className="font-semibold text-sm">Voice Navigation</span>
              <button
                onClick={() => onToggle(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              Current page: {getCurrentPageName()}
            </div>
            
            {currentCommand && (
              <div className="text-xs bg-blue-50 text-blue-700 p-2 rounded mb-2">
                Heard: "{currentCommand}"
              </div>
            )}
            
            {lastAction && (
              <div className="text-xs bg-green-50 text-green-700 p-2 rounded mb-2">
                Action: {lastAction}
              </div>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCommands(!showCommands)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                {showCommands ? 'Hide' : 'Show'} Commands
              </button>
              
              <button
                onClick={() => voiceService.speak('Voice navigation is active. Say help for available commands.')}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
              >
                Test Voice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commands Panel */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setShowCommands(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[80vh] overflow-y-auto m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <Navigation size={24} />
                    <span>Voice Navigation Commands</span>
                  </h2>
                  <button
                    onClick={() => setShowCommands(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedCommands).map(([category, commands]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-800 mb-3 capitalize">
                        {category} Commands
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {commands.map((command, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => {
                              command.action();
                              setShowCommands(false);
                            }}
                          >
                            <div className="text-blue-500">
                              {command.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                "{command.command}"
                              </div>
                              <div className="text-xs text-gray-600">
                                {command.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Speak clearly and wait for the system to respond</li>
                    <li>• You can use variations like "home" instead of "go home"</li>
                    <li>• Say "help" anytime to see available commands</li>
                    <li>• Voice navigation works continuously while active</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Navigation Toggle Button */}
      {!isActive && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={reducedMotion ? {} : { scale: 1.05 }}
          whileTap={reducedMotion ? {} : { scale: 0.95 }}
          onClick={() => onToggle(true)}
          className="fixed bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Enable Voice Navigation"
        >
          <Navigation size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default VoiceNavigation;
