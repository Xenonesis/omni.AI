import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, TrendingUp, Mic, ShoppingCart, X } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product } from '../types/marketplace';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, searchProducts, getBestOffer, getSellerById } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('popularity');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceResults, setShowVoiceResults] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Use search results if available, otherwise filter products normally
  const displayProducts = showVoiceResults && state.currentSearch?.products
    ? state.currentSearch.products
    : state.products;

  const categories = [
    { id: 'all', name: 'All Products', count: displayProducts.length },
    { id: 'electronics', name: 'Electronics', count: displayProducts.filter(p => p.category === 'electronics').length },
    { id: 'fashion', name: 'Fashion & Footwear', count: displayProducts.filter(p => p.category === 'fashion').length },
    { id: 'beauty', name: 'Beauty & Personal Care', count: displayProducts.filter(p => p.category === 'beauty').length },
  ];

  const filteredProducts = displayProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
  });

  // Check API status on component mount
  useEffect(() => {
    checkAPIStatus();
  }, []);

  // Check API status
  const checkAPIStatus = async () => {
    try {
      setApiStatus('checking');
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setApiStatus('connected');
        console.log('✅ Marketplace API is connected');
      } else {
        setApiStatus('disconnected');
        console.log('❌ Marketplace API health check failed');
      }
    } catch (error) {
      setApiStatus('disconnected');
      console.log('❌ Marketplace API is not available:', error);
    }
  };

  // Clean transcript function to remove unwanted punctuation
  const cleanTranscript = (text: string): string => {
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
  };

  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    setIsVoiceSearching(true);
    setVoiceTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Changed to Indian English for better accuracy

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;

      // Clean the transcript for display and processing
      const cleanedTranscript = cleanTranscript(transcript);
      setVoiceTranscript(cleanedTranscript);

      if (isFinal) {
        setSearchQuery(cleanedTranscript);
        setShowVoiceResults(true);

        try {
          console.log('🎤 Voice search query (original):', transcript);
          console.log('🧹 Voice search query (cleaned):', cleanedTranscript);
          // Search products and stay on marketplace page
          await searchProducts(cleanedTranscript, {
            category: selectedCategory !== 'all' ? selectedCategory : undefined
          });

          // Show success feedback
          console.log('✅ Voice search completed successfully');
        } catch (error) {
          console.error('❌ Voice search failed:', error);
          alert('Voice search failed. Please try again.');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsVoiceSearching(false);
      setVoiceTranscript('');
      alert(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.start();
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

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const bestOffer = getBestOffer(product.id);
    const seller = bestOffer ? getSellerById(bestOffer.sellerId) : null;
    const savings = bestOffer ? product.basePrice - bestOffer.price : 0;

    return (
      <Card
        className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {product.isLimitedEdition && (
            <span className="absolute top-2 left-2 bg-accent-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Limited Edition
            </span>
          )}
          {savings > 0 && (
            <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              Save Rs.{savings}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-neutral-600">
                {product.averageRating} ({product.totalReviews})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              {bestOffer ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary-600">
                    Rs.{bestOffer.price.toLocaleString()}
                  </span>
                  {savings > 0 && (
                    <span className="text-sm text-neutral-500 line-through">
                      Rs.{product.basePrice.toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-2xl font-bold text-neutral-900">
                  Rs.{product.basePrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.stockStatus === 'in-stock' ? 'bg-green-100 text-green-700' :
              product.stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {product.stockStatus.replace('-', ' ')}
            </div>
          </div>

          {seller && (
            <div className="text-sm text-neutral-600">
              Best offer from <span className="font-medium">{seller.name}</span>
            </div>
          )}
        </div>
      </Card>
    );
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
                {apiStatus === 'connected' && 'Real Data API Connected'}
                {apiStatus === 'disconnected' && 'Using Mock Data (API Offline)'}
                {apiStatus === 'checking' && 'Checking API Connection...'}
              </div>
            </div>

            {/* Voice Transcript Display */}
            {(isVoiceSearching || voiceTranscript) && (
              <div className="max-w-2xl mx-auto mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Mic className={`w-4 h-4 ${isVoiceSearching ? 'text-red-400 animate-pulse' : 'text-white'}`} />
                    <span className="text-white/80 text-sm">
                      {isVoiceSearching ? 'Listening...' : 'Voice Search:'}
                    </span>
                    <span className="text-white font-medium">
                      {voiceTranscript || 'Say something...'}
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

                <Button
                  onClick={handleVoiceSearch}
                  loading={isVoiceSearching}
                  icon={<Mic size={20} />}
                  variant="outline"
                  className="!bg-white/20 !text-white !border-white/30 hover:!bg-white/30"
                >
                  Voice Search
                </Button>

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
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
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
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>

              <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {showVoiceResults && searchQuery ? (
                  <>Search Results for "{searchQuery}"</>
                ) : (
                  <>{filteredProducts.length} Products Found</>
                )}
              </h2>
              {showVoiceResults && searchQuery && (
                <p className="text-neutral-600 mt-1">
                  Found {filteredProducts.length} products matching your {voiceTranscript ? 'voice' : 'text'} search
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {showVoiceResults && searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setVoiceTranscript('');
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
                onClick={() => navigate('/voice-shopping')}
                icon={<TrendingUp size={20} />}
                variant="outline"
              >
                AI Recommendations
              </Button>
            </div>
          </div>

          {sortedProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product, index) => (
                <ScrollReveal key={product.id} direction="up" delay={index * 0.1}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => setSelectedCategory('all')}>
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
