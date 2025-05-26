import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Grid, List, TrendingUp, Mic, X, BookmarkCheck } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types/marketplace';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';
import OptimizedProductCard from '../components/marketplace/OptimizedProductCard';
import Pagination from '../components/ui/Pagination';
import { useUnifiedVoiceSearch } from '../hooks/useUnifiedVoiceSearch';
import ProductSkeleton from '../components/ui/ProductSkeleton';
import { apiConnection } from '../services/apiConnection';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, searchProducts, getBestOffer, getSellerById } = useMarketplace();
  const { dispatch: appDispatch } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('popularity');
  const [showVoiceResults, setShowVoiceResults] = useState(false);

  // Unified voice search hook
  const voiceSearch = useUnifiedVoiceSearch({
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setSearchQuery(transcript);
        setShowVoiceResults(true);
      }
    },
    onError: (error) => {
      alert(error);
    },
    onSearchComplete: (query) => {
      console.log('✅ Voice search completed for:', query);
    }
  });
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(30); // Show all 30 products on one page

  // Initialize search query from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Memoized product calculations for better performance
  const displayProducts = useMemo(() =>
    showVoiceResults && state.currentSearch?.products
      ? state.currentSearch.products
      : state.products,
    [showVoiceResults, state.currentSearch?.products, state.products]
  );

  const categories = useMemo(() => [
    { id: 'all', name: 'All Products', count: displayProducts.length },
    { id: 'electronics', name: 'Electronics', count: displayProducts.filter(p => p.category.toLowerCase() === 'electronics').length },
    { id: 'fashion', name: 'Fashion & Footwear', count: displayProducts.filter(p => p.category.toLowerCase() === 'fashion').length },
    { id: 'beauty', name: 'Beauty & Personal Care', count: displayProducts.filter(p => p.category.toLowerCase() === 'beauty').length },
  ], [displayProducts]);

  const filteredProducts = useMemo(() =>
    displayProducts.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory;
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    }),
    [displayProducts, selectedCategory, searchQuery]
  );

  const sortedProducts = useMemo(() =>
    [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = getBestOffer(a.id)?.price || a.basePrice;
          const priceB = getBestOffer(b.id)?.price || b.basePrice;
          return priceA - priceB;
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'popularity':
          return b.totalReviews - a.totalReviews;
        default:
          return 0;
      }
    }),
    [filteredProducts, sortBy, getBestOffer]
  );

  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, productsPerPage]);

  // Optimized handlers with useCallback
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy as 'price' | 'rating' | 'popularity');
  }, []);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Track search when query changes - updated to work with API search results
  useEffect(() => {
    if (searchQuery.trim() && displayProducts.length > 0) {
      const timer = setTimeout(() => {
        console.log('📝 Adding search to history:', searchQuery, 'Products found:', displayProducts.length);

        appDispatch({
          type: 'ADD_SEARCH_HISTORY',
          payload: {
            query: searchQuery,
            product: displayProducts[0], // First result as representative
            recommendations: displayProducts.slice(0, 3).map(product => ({
              offer: {
                id: product.id,
                sellerId: getBestOffer(product.id)?.sellerId || 'direct',
                productId: product.id, // Add productId for navigation
                productName: product.name,
                price: getBestOffer(product.id)?.price || product.basePrice,
                originalPrice: product.basePrice,
                sellerName: getBestOffer(product.id) ? getSellerById(getBestOffer(product.id)!.sellerId)?.name || 'Unknown' : 'Direct',
                rating: product.averageRating,
                deliveryTime: '2-3 days',
                shippingCost: 0,
                currency: 'INR',
                stock: 10,
                estimatedDeliveryDays: 3,
                reputationScore: product.averageRating,
                returnPolicy: '30 days',
                inStock: product.stockStatus === 'in-stock',
                imageUrl: product.images[0],
                productUrl: `/product/${product.id}`,
                stockStatus: product.stockStatus,
                discount: getBestOffer(product.id)?.discount || 0,
                condition: getBestOffer(product.id)?.condition || 'new',
                lastUpdated: new Date().toISOString(),
              },
              totalScore: product.averageRating * 20,
              priceScore: 85,
              deliveryScore: 90,
              reputationScore: product.averageRating * 20,
              returnPolicyScore: 95,
            }))
          }
        });
      }, 1000); // Debounce search tracking

      return () => clearTimeout(timer);
    }
  }, [searchQuery, displayProducts, appDispatch, getBestOffer, getSellerById]);

  // Check API status on component mount and monitor connection
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

  // Use unified voice search function
  const handleVoiceSearch = () => {
    voiceSearch.startListening();
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        console.log('🔍 Text search query:', searchQuery);
        setShowVoiceResults(true);
        // Search products and stay on marketplace page
        await searchProducts(searchQuery, {
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        });
        console.log('✅ Text search completed successfully');
      } catch (error) {
        console.error('❌ Search failed:', error);
        alert('Search failed. Please try again.');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 text-white py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              OmniDimension Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Find the best deals on limited-edition items with AI-powered voice search
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
            </div>

            {/* Voice Transcript Display */}
            {(voiceSearch.state.isListening || voiceSearch.state.transcript || voiceSearch.state.interimTranscript) && (
              <div className="max-w-2xl mx-auto mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Mic className={`w-4 h-4 ${voiceSearch.state.isListening ? 'text-red-400 animate-pulse' : 'text-white'}`} />
                    <span className="text-white/80 text-sm">
                      {voiceSearch.state.isListening ? 'Listening...' : 'Voice Search:'}
                    </span>
                    <span className="text-white font-medium">
                      {voiceSearch.state.interimTranscript || voiceSearch.state.transcript || 'Say something...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products... (e.g., 'Nike Air Jordan 1 Chicago size 10')"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <motion.button
                  onClick={handleVoiceSearch}
                  disabled={voiceSearch.state.isListening || voiceSearch.state.isProcessing}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                    ${voiceSearch.state.isListening
                      ? 'bg-red-500 text-white shadow-lg'
                      : voiceSearch.state.isProcessing
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg'
                    }
                    focus:outline-none focus:ring-4 focus:ring-purple-300
                  `}
                  whileHover={!voiceSearch.state.isListening && !voiceSearch.state.isProcessing ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
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
                  {voiceSearch.state.isListening ? (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Mic size={20} />
                      </motion.div>
                      <span>Listening...</span>
                    </>
                  ) : voiceSearch.state.isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Mic size={20} />
                      </motion.div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      <span>Voice Search</span>
                    </>
                  )}
                </motion.button>

                <Button
                  onClick={handleSearch}
                  icon={<Search size={20} />}
                  className="!bg-white !text-primary-700 hover:!bg-neutral-100"
                >
                  Search
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between w-full">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-center md:justify-end">
              <select
                value={productsPerPage}
                onChange={(e) => {
                  setProductsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Products per page"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={30}>30 per page (All)</option>
                <option value={50}>50 per page</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Sort products by"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>

              <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}
                  aria-label="List view"
                  title="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {showVoiceResults && searchQuery ? (
                  <>Search Results for "{searchQuery}"</>
                ) : (
                  <>{sortedProducts.length} Products Found</>
                )}
              </h2>
              {showVoiceResults && searchQuery && (
                <p className="text-neutral-600 mt-1">
                  Found {sortedProducts.length} products matching your {voiceSearch.state.transcript ? 'voice' : 'text'} search
                </p>
              )}
              {totalPages > 1 && (
                <p className="text-neutral-500 text-sm mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {showVoiceResults && searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    voiceSearch.reset();
                    setShowVoiceResults(false);
                    setSelectedCategory('all');
                  }}
                  variant="outline"
                  icon={<X size={20} />}
                >
                  Clear Search
                </Button>
              )}

              <Button
                onClick={() => navigate('/saved-deals')}
                icon={<BookmarkCheck size={20} />}
                variant="outline"
              >
                Saved Deals
              </Button>
              <Button
                onClick={() => navigate('/voice-shopping')}
                icon={<TrendingUp size={20} />}
                variant="outline"
              >
                AI Recommendations
              </Button>
            </div>
          </div>

          {state.loading ? (
            <ProductSkeleton count={productsPerPage} viewMode={viewMode} />
          ) : currentProducts.length > 0 ? (
            <>
              <div className={`grid gap-3 sm:gap-4 md:gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-1'
              }`}>
                {currentProducts.map((product, index) => (
                  <OptimizedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mb-8"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => handleCategoryChange('all')}>
                View All Products
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketplacePage;
