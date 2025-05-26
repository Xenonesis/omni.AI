import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import {
  MarketplaceState,
  Product,
  Seller,
  SellerOffer,
  CartItem,
  Order,
  VoiceSearchResult,
  ProductRecommendation,
  SearchFilters
} from '../types/marketplace';
import { correctSpelling } from '../utils/fuzzySearch';
import { apiConnection } from '../services/apiConnection';
import { indianProducts, indianSellers, generateIndianOffers } from '../data/indianProducts';

type MarketplaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_SELLERS'; payload: Record<string, Seller> }
  | { type: 'SET_OFFERS'; payload: Record<string, SellerOffer[]> }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<Order> } }
  | { type: 'SET_SEARCH_RESULT'; payload: VoiceSearchResult }
  | { type: 'CLEAR_SEARCH' };

const initialState: MarketplaceState = {
  products: [],
  sellers: {},
  offers: {},
  cart: [],
  orders: [],
  currentSearch: null,
  loading: false,
  error: null,
};

const MarketplaceContext = createContext<{
  state: MarketplaceState;
  dispatch: React.Dispatch<MarketplaceAction>;
  // Helper functions
  searchProducts: (query: string, filters?: SearchFilters, addToHistory?: boolean) => Promise<VoiceSearchResult>;
  getProductById: (id: string) => Product | undefined;
  getSellerById: (id: string) => Seller | undefined;
  getOffersForProduct: (productId: string) => SellerOffer[];
  getBestOffer: (productId: string) => SellerOffer | undefined;
  addToCart: (productId: string, offerId: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  getCartTotal: () => number;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  sendRecommendationEmail: (recommendations: ProductRecommendation[]) => Promise<void>;
  logToGoogleSheets: (data: any) => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  searchProducts: async () => ({ query: '', products: [], filters: {}, recommendations: [], timestamp: '' }),
  getProductById: () => undefined,
  getSellerById: () => undefined,
  getOffersForProduct: () => [],
  getBestOffer: () => undefined,
  addToCart: () => {},
  removeFromCart: () => {},
  getCartTotal: () => 0,
  createOrder: async () => ({} as Order),
  sendRecommendationEmail: async () => {},
  logToGoogleSheets: async () => {},
});

const marketplaceReducer = (state: MarketplaceState, action: MarketplaceAction): MarketplaceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_SELLERS':
      return { ...state, sellers: action.payload };
    case 'SET_OFFERS':
      return { ...state, offers: action.payload };
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, ...action.payload.updates } : order
        ),
      };
    case 'SET_SEARCH_RESULT':
      return { ...state, currentSearch: action.payload };
    case 'CLEAR_SEARCH':
      return { ...state, currentSearch: null };
    default:
      return state;
  }
};

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(marketplaceReducer, initialState);

  // Helper function to transform API products
  const transformAPIProduct = (apiProduct: any): Product => {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      category: apiProduct.category,
      brand: apiProduct.brand,
      description: apiProduct.description,
      specifications: {},
      images: [apiProduct.image],
      basePrice: apiProduct.price,
      averageRating: apiProduct.rating,
      totalReviews: apiProduct.reviews,
      tags: apiProduct.tags,
      releaseDate: new Date().toISOString(),
      isLimitedEdition: false,
      stockStatus: apiProduct.inStock ? 'in-stock' : 'out-of-stock',
    };
  };

  // Initialize data - ensure API connection
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      console.log('🔄 Initializing marketplace data...');

      // Check API connection status
      const apiStatus = apiConnection.getStatus();

      if (apiStatus.apiUrl === 'fallback-mode' || !apiStatus.isConnected) {
        console.log('🔄 API in fallback mode, using Indian product database');
        initializeFallbackData();
        return;
      }

      // Try to wait for API connection (reduced timeout)
      const isConnected = await apiConnection.waitForConnection(10000); // 10 second timeout
      if (!isConnected) {
        console.log('🔄 API connection timeout, using fallback data');
        initializeFallbackData();
        return;
      }

      try {
        const response = await apiConnection.makeRequest('/api/search?q=');

        if (response.ok) {
          const apiData = await response.json();
          console.log('✅ Fetched products from API:', apiData.products?.length || 0, 'products');

          if (apiData.products && apiData.products.length > 0) {
            // Transform API products to our format
            const transformedProducts = apiData.products.map(transformAPIProduct);
            dispatch({ type: 'SET_PRODUCTS', payload: transformedProducts });

            // Create mock sellers and offers for API products
            const apiSellers: Record<string, Seller> = {};
            const apiOffers: Record<string, SellerOffer[]> = {};

            transformedProducts.forEach((product, index) => {
              // Create a seller for each product using the actual seller name from API
              const apiProduct = apiData.products[index];
              const sellerId = `seller_${product.id}`;
              apiSellers[sellerId] = {
                id: sellerId,
                name: apiProduct.seller || 'Indian Marketplace',
                logo: 'https://via.placeholder.com/100x100?text=' + (apiProduct.seller ? apiProduct.seller.substring(0, 2) : 'IM'),
                rating: 4.5 + Math.random() * 0.5,
                totalSales: Math.floor(Math.random() * 10000) + 1000,
                location: 'India',
                verificationStatus: 'verified',
                responseTime: '< 2 hours',
                memberSince: '2020-01-01',
                specialties: [product.category],
              };

              // Create offers for each product
              apiOffers[product.id] = [{
                id: `offer_${product.id}`,
                sellerId,
                productId: product.id,
                price: product.basePrice,
                originalPrice: product.basePrice * 1.2,
                discount: Math.floor(((product.basePrice * 1.2 - product.basePrice) / (product.basePrice * 1.2)) * 100),
                condition: 'new',
                stockQuantity: Math.floor(Math.random() * 50) + 10,
                shippingOptions: [{
                  id: 'standard',
                  name: 'Standard Shipping',
                  price: 0,
                  estimatedDays: 5,
                  carrier: 'India Post',
                  tracking: true,
                  insurance: false,
                }],
                returnPolicy: {
                  returnsAccepted: true,
                  returnWindow: 30,
                  returnShipping: 'buyer-pays',
                  conditions: ['Item must be in original condition'],
                },
                authenticity: {
                  guaranteed: true,
                  verificationMethod: 'Seller verification',
                  certificate: 'VERIFIED',
                },
                lastUpdated: new Date().toISOString(),
              }];
            });

            dispatch({ type: 'SET_SELLERS', payload: apiSellers });
            dispatch({ type: 'SET_OFFERS', payload: apiOffers });

            console.log('✅ Marketplace initialized with API data');
          } else {
            console.log('🔄 API returned no products, using fallback data');
            initializeFallbackData();
          }
        } else {
          throw new Error(`API responded with status: ${response.status}`);
        }
      } catch (apiError) {
        console.log('🔄 API request failed, using fallback data:', apiError);
        initializeFallbackData();
      }
    } catch (error) {
      console.error('❌ Failed to initialize marketplace data:', error);
      console.log('🔄 Using fallback data due to initialization error');
      initializeFallbackData();
    }
  };

  // Initialize with comprehensive Indian product database
  const initializeFallbackData = () => {
    console.log('🇮🇳 Initializing with Indian product database');
    console.log('📦 Loading', indianProducts.length, 'Indian products');

    // Set products
    dispatch({ type: 'SET_PRODUCTS', payload: indianProducts });

    // Set sellers
    dispatch({ type: 'SET_SELLERS', payload: indianSellers });

    // Generate and set offers
    const offers = generateIndianOffers();
    dispatch({ type: 'SET_OFFERS', payload: offers });

    console.log('✅ Marketplace initialized with Indian product database');
    console.log('🏪 Sellers:', Object.keys(indianSellers).length);
    console.log('🛍️ Products:', indianProducts.length);
    console.log('💰 Offers:', Object.keys(offers).length);
  };

  // Helper functions
  const searchProducts = async (query: string, filters: SearchFilters = {}): Promise<VoiceSearchResult> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      console.log('🔍 Searching with query:', query, 'filters:', filters);

      // Check if API is available
      const apiStatus = apiConnection.getStatus();

      if (apiStatus.apiUrl === 'fallback-mode' || !apiStatus.isConnected) {
        console.log('🔄 Using local search in fallback mode');
        const result = searchLocalProducts(query, filters);
        dispatch({ type: 'SET_SEARCH_RESULT', payload: result });
        return result;
      }

      try {
        // Try API search first
        const apiResult = await fetchFromSearchAPI(query, filters);

        if (apiResult && apiResult.products && apiResult.products.length > 0) {
          console.log('✅ API Result received:', apiResult);
          const result: VoiceSearchResult = {
            query,
            products: apiResult.products.map(transformAPIProduct),
            filters,
            recommendations: apiResult.recommendations?.map(transformAPIRecommendation) || [],
            timestamp: new Date().toISOString(),
          };

          console.log('📊 Transformed result:', result);
          dispatch({ type: 'SET_SEARCH_RESULT', payload: result });
          return result;
        } else {
          throw new Error('API returned no results');
        }
      } catch (apiError) {
        console.log('🔄 API search failed, using local search:', apiError);
        const result = searchLocalProducts(query, filters);
        dispatch({ type: 'SET_SEARCH_RESULT', payload: result });
        return result;
      }

    } catch (error) {
      console.error('❌ Search failed:', error);
      // Fallback to local search
      const result = searchLocalProducts(query, filters);
      dispatch({ type: 'SET_SEARCH_RESULT', payload: result });
      return result;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Local search function for Indian products
  const searchLocalProducts = (query: string, filters: SearchFilters = {}): VoiceSearchResult => {
    console.log('🇮🇳 Searching local Indian products for:', query);

    const correctedQuery = correctSpelling(query.toLowerCase());
    let filteredProducts = [...indianProducts];

    // Apply text search
    if (correctedQuery.trim()) {
      filteredProducts = filteredProducts.filter(product => {
        const searchText = `${product.name} ${product.brand} ${product.category} ${product.description} ${product.tags?.join(' ')}`.toLowerCase();
        const queryWords = correctedQuery.split(' ');
        return queryWords.some(word => searchText.includes(word));
      });
    }

    // Apply filters
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.brand) {
      filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filteredProducts = filteredProducts.filter(p => {
        return (!min || p.basePrice >= min) && (!max || p.basePrice <= max);
      });
    }

    // Sort by relevance (simple scoring)
    filteredProducts.sort((a, b) => {
      const aScore = calculateRelevanceScore(a, correctedQuery);
      const bScore = calculateRelevanceScore(b, correctedQuery);
      return bScore - aScore;
    });

    // Limit results
    const limitedProducts = filteredProducts.slice(0, 20);

    console.log('🔍 Local search found', limitedProducts.length, 'products');

    return {
      query,
      products: limitedProducts,
      filters,
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
  };

  // Calculate relevance score for local search
  const calculateRelevanceScore = (product: Product, query: string): number => {
    let score = 0;
    const queryWords = query.toLowerCase().split(' ');
    const productText = `${product.name} ${product.brand} ${product.category}`.toLowerCase();

    queryWords.forEach(word => {
      if (product.name.toLowerCase().includes(word)) score += 10;
      if (product.brand.toLowerCase().includes(word)) score += 8;
      if (product.category.toLowerCase().includes(word)) score += 6;
      if (productText.includes(word)) score += 3;
    });

    // Boost popular products
    score += product.averageRating * 2;
    score += Math.log(product.totalReviews + 1);

    return score;
  };

  // API helper functions
  const fetchFromSearchAPI = async (query: string, filters: SearchFilters = {}): Promise<any> => {
    try {
      // Apply spell correction to improve search accuracy
      const correctedQuery = correctSpelling(query);
      console.log('🔤 API Search - Original:', query, '→ Corrected:', correctedQuery);

      const searchParams = new URLSearchParams({
        q: correctedQuery,
        ...(filters.category && { category: filters.category }),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.priceRange && filters.priceRange[0] && { min_price: filters.priceRange[0].toString() }),
        ...(filters.priceRange && filters.priceRange[1] && { max_price: filters.priceRange[1].toString() }),
        ...(filters.size && { size: filters.size }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.location && { location: filters.location }),
        ...(filters.shippingSpeed && { shipping_speed: filters.shippingSpeed }),
      });

      const endpoint = `/api/search?${searchParams}`;
      console.log('🌐 Fetching from API:', endpoint);

      const response = await apiConnection.makeRequest(endpoint);
      console.log('📡 API Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('✅ API Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Search API not available:', error);
      console.error('   Error details:', error.message);
      throw new Error(`API connection failed: ${error.message}`);
    }
  };



  const transformAPIRecommendation = (apiRec: any): ProductRecommendation => {
    const product = transformAPIProduct(apiRec.product);

    // Create a mock seller offer
    const bestOffer: SellerOffer = {
      id: `offer_${product.id}_api`,
      sellerId: 'api_seller',
      productId: product.id,
      price: apiRec.product.price,
      originalPrice: apiRec.product.originalPrice,
      discount: apiRec.product.discount,
      condition: 'new',
      stockQuantity: 10,
      shippingOptions: [
        {
          id: 'standard',
          name: 'Standard Shipping',
          price: 0,
          estimatedDays: 5,
          carrier: 'USPS',
          tracking: true,
          insurance: false,
        },
      ],
      returnPolicy: {
        returnsAccepted: true,
        returnWindow: 30,
        returnShipping: 'buyer-pays',
        conditions: ['Item must be in original condition'],
      },
      authenticity: {
        guaranteed: true,
        verificationMethod: 'Third-party authentication',
        certificate: 'API-VERIFIED',
      },
      lastUpdated: new Date().toISOString(),
    };

    // Create a mock seller
    const seller: Seller = {
      id: 'api_seller',
      name: 'API Marketplace',
      logo: 'https://via.placeholder.com/100x100?text=API',
      rating: 4.8,
      totalSales: 10000,
      location: 'Online',
      verificationStatus: 'verified',
      responseTime: '< 1 hour',
      memberSince: '2020-01-01',
      specialties: ['All Categories'],
    };

    return {
      product,
      bestOffer,
      seller,
      score: apiRec.score || Math.random() * 100,
      reasons: apiRec.reasons || ['Best price', 'High rating', 'Fast shipping'],
      savings: apiRec.savings || 0,
    };
  };

  const getProductById = (id: string): Product | undefined => {
    return state.products.find(product => product.id === id);
  };

  const getSellerById = (id: string): Seller | undefined => {
    return state.sellers[id];
  };

  const getOffersForProduct = (productId: string): SellerOffer[] => {
    return state.offers[productId] || [];
  };

  const getBestOffer = (productId: string): SellerOffer | undefined => {
    const offers = getOffersForProduct(productId);
    return offers.sort((a, b) => a.price - b.price)[0];
  };

  const addToCart = (productId: string, offerId: string, quantity: number = 1): void => {
    const cartItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random()}`,
      productId,
      offerId,
      quantity,
      selectedShipping: 'standard',
      addedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const removeFromCart = (itemId: string): void => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const getCartTotal = (): number => {
    return state.cart.reduce((total, item) => {
      const offer = Object.values(state.offers).flat().find(o => o.id === item.offerId);
      return total + (offer ? offer.price * item.quantity : 0);
    }, 0);
  };

  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const order: Order = {
      id: `order_${Date.now()}`,
      userId: 'user_1',
      items: [],
      totalAmount: 0,
      status: 'pending-payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumbers: {},
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...orderData,
    } as Order;

    dispatch({ type: 'ADD_ORDER', payload: order });
    return order;
  };

  const sendRecommendationEmail = async (recommendations: ProductRecommendation[]): Promise<void> => {
    // Mock email sending
    console.log('Sending recommendation email:', recommendations);
    // In a real app, this would integrate with an email service
  };

  const logToGoogleSheets = async (data: any): Promise<void> => {
    // Mock Google Sheets logging
    console.log('Logging to Google Sheets:', data);
    // In a real app, this would integrate with Google Sheets API
  };

  return (
    <MarketplaceContext.Provider
      value={{
        state,
        dispatch,
        searchProducts,
        getProductById,
        getSellerById,
        getOffersForProduct,
        getBestOffer,
        addToCart,
        removeFromCart,
        getCartTotal,
        createOrder,
        sendRecommendationEmail,
        logToGoogleSheets,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => useContext(MarketplaceContext);
