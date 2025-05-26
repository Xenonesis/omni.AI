import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Star, TrendingUp, ShoppingCart, Mail, ExternalLink, Check, X, Navigation } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductRecommendation } from '../types/marketplace';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';
import EnhancedVoiceSearch from '../components/voice/EnhancedVoiceSearch';
import VoiceNavigation from '../components/voice/VoiceNavigation';
import { apiConnection } from '../services/apiConnection';

const VoiceShoppingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, searchProducts, addToCart, sendRecommendationEmail, logToGoogleSheets } = useMarketplace();
  const [isListening, setIsListening] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [voiceNavigationActive, setVoiceNavigationActive] = useState(false);
  const [useEnhancedVoice, setUseEnhancedVoice] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const recommendations = state.currentSearch?.recommendations || [];

  useEffect(() => {
    // Auto-send email with top 3 recommendations when search results are available
    if (recommendations.length > 0 && !emailSent) {
      handleSendEmail();
    }
  }, [recommendations, emailSent]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleEnhancedVoiceResults = async (results: any) => {
    console.log('Enhanced voice search results:', results);

    // If we have a query, trigger the marketplace search to update the UI
    if (results.query) {
      try {
        // Use the marketplace search function to get real data and update state
        await searchProducts(results.query, {
          category: results.category,
          brand: results.brand,
          priceRange: results.priceRange ? [results.priceRange.min || 0, results.priceRange.max || 10000] : undefined,
        });

        // Update the current query for display
        setCurrentQuery(results.query);
      } catch (error) {
        console.error('Failed to search products:', error);
      }
    }

    // Log search to Google Sheets
    await logToGoogleSheets({
      timestamp: new Date().toISOString(),
      query: results.query || 'Enhanced voice search',
      userId: 'user_1',
      resultsCount: results.products?.length || 0,
      searchType: 'enhanced_voice',
    });
  };

  const handleVoiceNavigation = (destination: string) => {
    navigate(`/${destination}`);
  };

  // Monitor API connection status
  useEffect(() => {
    const updateApiStatus = () => {
      const status = apiConnection.getStatus();
      if (status.isConnected) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    };

    // Initial status check
    updateApiStatus();

    // Listen for connection status changes
    const handleConnectionChange = () => {
      updateApiStatus();
    };

    // Listen for API connection events
    window.addEventListener('api-connection-failed', handleConnectionChange);

    // Check status periodically
    const statusInterval = setInterval(updateApiStatus, 5000);

    return () => {
      window.removeEventListener('api-connection-failed', handleConnectionChange);
      clearInterval(statusInterval);
    };
  }, []);

  // Test function to directly call the API using the new service
  const testAPIDirectly = async () => {
    try {
      console.log('🧪 Testing API directly...');
      setApiStatus('checking');

      const response = await apiConnection.makeRequest('/api/search?q=nike&max_price=500');
      const data = await response.json();
      console.log('📊 Direct API Response:', data);
      setApiStatus('connected');

      // Show results in an alert for immediate feedback
      alert(`API Test Successful!\n\nFound ${data.total} products\nFirst product: ${data.products[0]?.name || 'None'}\nRecommendations: ${data.recommendations?.length || 0}`);

      // Trigger search with the same query to compare
      await searchProducts('nike', { priceRange: [0, 500] });
    } catch (error) {
      console.error('❌ Direct API test failed:', error);
      setApiStatus('disconnected');
      const status = apiConnection.getStatus();
      alert(`API Test Failed!\n\nError: ${error.message}\n\nEnvironment: ${status.environment}\nAPI URL: ${status.apiUrl}`);
    }
  };

  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    setIsListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentQuery(transcript);
      setIsProcessing(true);

      try {
        await searchProducts(transcript);

        // Log search to Google Sheets
        await logToGoogleSheets({
          timestamp: new Date().toISOString(),
          query: transcript,
          userId: 'user_1',
          resultsCount: state.currentSearch?.products.length || 0,
        });
      } catch (error) {
        console.error('Voice search failed:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSendEmail = async () => {
    if (recommendations.length > 0) {
      try {
        const topRecommendations = recommendations.slice(0, 3);
        await sendRecommendationEmail(topRecommendations);
        setEmailSent(true);

        // Log email sent to Google Sheets
        await logToGoogleSheets({
          timestamp: new Date().toISOString(),
          action: 'email_sent',
          userId: 'user_1',
          query: state.currentSearch?.query,
          recommendationsCount: topRecommendations.length,
        });
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }
  };

  const handleAddToCart = (recommendation: ProductRecommendation) => {
    addToCart(recommendation.product.id, recommendation.bestOffer.id);
    setSelectedRecommendations(prev => [...prev, recommendation.product.id]);

    // Log add to cart action
    logToGoogleSheets({
      timestamp: new Date().toISOString(),
      action: 'add_to_cart',
      userId: 'user_1',
      productId: recommendation.product.id,
      offerId: recommendation.bestOffer.id,
      price: recommendation.bestOffer.price,
    });
  };

  const RecommendationCard: React.FC<{ recommendation: ProductRecommendation; index: number }> = ({
    recommendation,
    index
  }) => {
    const { product, bestOffer, seller, reasons, savings } = recommendation;
    const isInCart = selectedRecommendations.includes(product.id);

    return (
      <Card className="h-full hover:shadow-2xl transition-all duration-300">
        <div className="relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 left-2 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            #{index + 1} Best Match
          </div>
          {savings > 0 && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Save ${savings}
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="font-bold text-xl text-neutral-900 mb-3">
            {product.name}
          </h3>

          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-neutral-600">
                {product.averageRating} ({product.totalReviews} reviews)
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-primary-600">
                ${bestOffer.price}
              </span>
              {savings > 0 && (
                <span className="text-lg text-neutral-500 line-through">
                  ${product.basePrice}
                </span>
              )}
            </div>

            <div className="text-sm text-neutral-600 mb-3">
              Best offer from <span className="font-semibold text-primary-600">{seller.name}</span>
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="ml-1">{seller.rating} seller rating</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-sm text-neutral-900 mb-2">Why this is perfect for you:</h4>
            <ul className="space-y-1">
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-center text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              fullWidth
              onClick={() => handleAddToCart(recommendation)}
              disabled={isInCart}
              icon={isInCart ? <Check size={20} /> : <ShoppingCart size={20} />}
              variant={isInCart ? 'outline' : 'primary'}
              className={isInCart ? '!bg-green-50 !text-green-700 !border-green-200' : ''}
            >
              {isInCart ? 'Added to Cart' : 'Add to Cart'}
            </Button>

            <Button
              fullWidth
              variant="outline"
              onClick={() => navigate(`/product/${product.id}`)}
              icon={<ExternalLink size={20} />}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Voice Search Interface */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal direction="up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI Voice Shopping Assistant
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Speak naturally to find the perfect deals. Our AI understands your preferences and finds the best offers.
            </p>

            {/* API Status Indicator */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                apiStatus === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : apiStatus === 'disconnected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'connected'
                    ? 'bg-green-500'
                    : apiStatus === 'disconnected'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`} />
                {apiStatus === 'connected' && (
                  <>
                    Real Data API Connected
                    <span className="ml-2 text-xs opacity-75">
                      ({apiConnection.getStatus().environment} • {apiConnection.getStatus().apiUrl.includes('localhost') ? 'Local' : 'Production'})
                    </span>
                  </>
                )}
                {apiStatus === 'disconnected' && 'API Connection Failed - Retrying...'}
                {apiStatus === 'checking' && 'Checking API Connection...'}
              </div>
              {apiStatus === 'connected' && (
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={testAPIDirectly}
                    className="text-xs text-primary-100 hover:text-white underline"
                  >
                    Test API Connection
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Voice Interface */}
            <div className="max-w-2xl mx-auto mb-8">
              {useEnhancedVoice ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <EnhancedVoiceSearch
                    onSearchResults={handleEnhancedVoiceResults}
                    onNavigate={handleVoiceNavigation}
                    autoSpeak={true}
                    showTranscript={true}
                    showConfidence={true}
                    reducedMotion={reducedMotion}
                    className="text-white"
                  />

                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setUseEnhancedVoice(false)}
                      className="text-sm text-primary-100 hover:text-white underline"
                    >
                      Use Simple Voice Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceNavigationActive(!voiceNavigationActive)}
                      className="text-sm text-primary-100 hover:text-white underline flex items-center space-x-1"
                    >
                      <Navigation size={16} />
                      <span>{voiceNavigationActive ? 'Disable' : 'Enable'} Voice Navigation</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <motion.button
                    onClick={handleVoiceSearch}
                    disabled={isListening || isProcessing}
                    className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 ${
                      isListening
                        ? 'bg-red-500 shadow-lg shadow-red-500/50'
                        : 'bg-white/20 hover:bg-white/30 shadow-xl'
                    }`}
                    whileHover={reducedMotion ? {} : { scale: isListening ? 1 : 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    animate={reducedMotion ? {} : (isListening ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(239, 68, 68, 0.4)",
                        "0 0 0 20px rgba(239, 68, 68, 0)",
                        "0 0 0 0 rgba(239, 68, 68, 0)"
                      ]
                    } : {})}
                    transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={reducedMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                      />
                    ) : isListening ? (
                      <MicOff size={48} />
                    ) : (
                      <Mic size={48} />
                    )}
                  </motion.button>

                  <p className="mt-4 text-primary-100">
                    {isListening ? 'Listening...' :
                     isProcessing ? 'Processing your request...' :
                     'Click to start voice search'}
                  </p>

                  {currentQuery && (
                    <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm text-primary-100">You said:</p>
                      <p className="font-semibold">"{currentQuery}"</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setUseEnhancedVoice(true)}
                    className="mt-4 text-sm text-primary-100 hover:text-white underline"
                  >
                    Use Enhanced AI Voice Search
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Search Results */}
      {state.currentSearch && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  AI-Powered Recommendations
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-6">
                  Based on your search "{state.currentSearch.query}", here are the best deals we found:
                </p>

                {emailSent && (
                  <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Mail className="w-4 h-4 mr-2" />
                    Top 3 recommendations sent to your email!
                  </div>
                )}
              </div>
            </ScrollReveal>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((recommendation, index) => (
                  <ScrollReveal key={recommendation.product.id} direction="up" delay={index * 0.2}>
                    <RecommendationCard recommendation={recommendation} index={index} />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">No recommendations yet</h3>
                <p className="text-neutral-600 mb-6">Use voice search to get AI-powered product recommendations</p>
                <Button onClick={handleVoiceSearch} icon={<Mic size={20} />}>
                  Start Voice Search
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {recommendations.length > 0 && (
              <ScrollReveal direction="up" delay={0.6}>
                <div className="text-center mt-12 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigate('/orders')}
                      icon={<ShoppingCart size={20} />}
                      size="lg"
                    >
                      View Cart & Checkout
                    </Button>

                    <Button
                      onClick={() => navigate('/marketplace')}
                      variant="outline"
                      icon={<TrendingUp size={20} />}
                      size="lg"
                    >
                      Browse More Products
                    </Button>
                  </div>

                  <Button
                    onClick={handleVoiceSearch}
                    variant="outline"
                    icon={<Mic size={20} />}
                  >
                    Search for Something Else
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={testAPIDirectly}
                      variant="outline"
                      className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      🧪 Test API
                    </Button>

                    <Button
                      onClick={() => searchProducts('nike shoes', { priceRange: [0, 500] })}
                      variant="outline"
                      className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      🔍 Search Nike
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>
      )}

      {/* Voice Navigation */}
      <VoiceNavigation
        isActive={voiceNavigationActive}
        onToggle={setVoiceNavigationActive}
        reducedMotion={reducedMotion}
      />
    </div>
  );
};

export default VoiceShoppingPage;
