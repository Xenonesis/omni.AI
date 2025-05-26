import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic, Settings, Clock, BookmarkCheck, Store, ShoppingCart, Menu, X,
  Search, Bell, User, ChevronDown, Home, Sparkles, Zap, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedVoiceSearch } from '../../hooks/useUnifiedVoiceSearch';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Unified voice search hook
  const voiceSearch = useUnifiedVoiceSearch({
    onSearchComplete: () => {
      navigate('/marketplace');
    },
    onError: (error) => {
      console.error('Voice search error:', error);
      navigate('/marketplace');
    }
  });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Navigation items configuration
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      badge: null,
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Store,
      path: '/marketplace',
      badge: null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      path: '/orders',
      badge: state.savedDeals?.length > 0 ? state.savedDeals.length : null,
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      path: '/history',
      badge: null,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: BookmarkCheck,
      path: '/saved-deals',
      badge: state.savedDeals?.length > 0 ? state.savedDeals.length : null,
    },
  ];

  const handleStartSearch = async () => {
    try {
      await voiceSearch.startListening();
      navigate('/marketplace');
    } catch (error) {
      console.error('Voice search error:', error);
      navigate('/marketplace');
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getVoiceSearchStatus = () => {
    if (voiceSearch.state.isListening) return 'listening';
    if (voiceSearch.state.isProcessing) return 'processing';
    return 'idle';
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 safe-top ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 shadow-lg shadow-neutral-900/5'
          : 'bg-white/80 backdrop-blur-md border-b border-neutral-200'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto mobile-container">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex items-center cursor-pointer group touch-target"
              aria-label="Go to homepage"
            >
              <div className="relative">
                <span className="text-primary-800 font-bold text-lg sm:text-xl md:text-2xl group-hover:text-primary-900 transition-colors">
                  omniverse
                </span>
                <span className="text-accent-600 font-light text-lg sm:text-xl md:text-2xl group-hover:text-accent-700 transition-colors">
                  .AI
                </span>
                {/* Subtle glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </div>
            </motion.button>

            {/* Breadcrumb for non-home pages */}
            <AnimatePresence>
              {location.pathname !== '/' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hidden sm:flex items-center gap-2 text-sm text-neutral-500"
                >
                  <span>/</span>
                  <span className="capitalize font-medium text-neutral-700">
                    {location.pathname.split('/')[1] || 'Home'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.slice(1, 4).map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 touch-target ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={item.label}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>

                  {/* Badge */}
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-100 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Quick Actions - Desktop Only */}
            <div className="hidden md:flex items-center gap-1">
              <motion.button
                type="button"
                onClick={() => navigate('/saved-deals')}
                className="relative p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Saved Deals"
              >
                <BookmarkCheck size={18} />
                {state.savedDeals?.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                  >
                    {state.savedDeals.length > 9 ? '9+' : state.savedDeals.length}
                  </motion.span>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="User Menu"
              >
                <Settings size={18} />
              </motion.button>
            </div>

            {/* Enhanced Voice Search Button */}
            <motion.button
              whileHover={!voiceSearch.state.isListening && !voiceSearch.state.isProcessing ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartSearch}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold transition-all duration-300 overflow-hidden
                ${voiceSearch.state.isListening
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                  : voiceSearch.state.isProcessing
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 text-white hover:from-primary-700 hover:via-purple-700 hover:to-accent-700 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30'
                }
                focus:outline-none focus:ring-4 focus:ring-primary-300/50 touch-target
              `}
              disabled={voiceSearch.state.isProcessing}
              aria-label={`Voice Search - ${getVoiceSearchStatus()}`}
              animate={voiceSearch.state.isListening ? {
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0.4)",
                  "0 0 0 20px rgba(239, 68, 68, 0)",
                  "0 0 0 0 rgba(239, 68, 68, 0)"
                ]
              } : {}}
              transition={{
                boxShadow: {
                  duration: 1.5,
                  repeat: voiceSearch.state.isListening ? Infinity : 0,
                  ease: "easeInOut"
                }
              }}
            >
              {/* Background glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0"
                animate={voiceSearch.state.isListening ? {
                  opacity: [0, 1, 0],
                  x: ['-100%', '100%']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {voiceSearch.state.isListening ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <Mic size={18} />
                  </motion.div>
                  <span className="hidden sm:inline relative z-10">Listening...</span>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-2 h-2 bg-white rounded-full relative z-10"
                  />
                </>
              ) : voiceSearch.state.isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <Activity size={18} />
                  </motion.div>
                  <span className="hidden sm:inline relative z-10">Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="relative z-10" />
                  <span className="hidden sm:inline relative z-10 font-medium">Voice Search</span>
                </>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative p-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800 transition-all duration-200 touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification dot for saved items */}
              {state.savedDeals?.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full"
                />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 shadow-xl shadow-neutral-900/10 safe-left safe-right"
          >
            <div className="container mx-auto mobile-container py-6">
              {/* Quick Stats */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-700">{state.savedDeals?.length || 0}</div>
                  <div className="text-xs text-primary-600">Saved Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-700">
                    {getVoiceSearchStatus() === 'idle' ? '🎤' : getVoiceSearchStatus() === 'listening' ? '🔴' : '⚡'}
                  </div>
                  <div className="text-xs text-accent-600 capitalize">{getVoiceSearchStatus()}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">✨</div>
                  <div className="text-xs text-green-600">AI Ready</div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-4 w-full p-4 rounded-2xl font-medium transition-all duration-200 touch-target ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 shadow-md'
                          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-2 rounded-xl ${
                        isActive
                          ? 'bg-primary-200 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-xs text-neutral-500">
                          {item.id === 'home' && 'Voice AI Marketplace'}
                          {item.id === 'marketplace' && 'Browse Products'}
                          {item.id === 'orders' && 'Your Orders'}
                          {item.id === 'history' && 'Search History'}
                          {item.id === 'saved' && 'Saved Items'}
                        </div>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-accent-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </motion.div>
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="w-1 h-8 bg-primary-500 rounded-full"
                          layoutId="mobileActiveIndicator"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Settings Section */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <motion.button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800 transition-all duration-200 touch-target"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-xl bg-neutral-100 text-neutral-600">
                    <Settings size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Settings</div>
                    <div className="text-xs text-neutral-500">Preferences & Account</div>
                  </div>
                </motion.button>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="text-center text-xs text-neutral-500">
                  <span className="font-semibold text-primary-600">omniverse.AI</span> • Voice-Powered Marketplace
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Menu Dropdown */}
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-4 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-neutral-900/10 border border-neutral-200/80 overflow-hidden z-50"
          >
            <div className="p-4">
              <div className="text-sm font-semibold text-neutral-800 mb-2">Quick Actions</div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/history');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors text-sm"
                >
                  <Clock size={16} />
                  <span>Voice History</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;