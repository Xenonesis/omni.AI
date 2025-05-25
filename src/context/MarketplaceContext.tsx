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
import { mockProducts, mockSellers, mockOffers } from '../data/mockMarketplaceData';
import { FuzzySearchEngine, correctSpelling } from '../utils/fuzzySearch';

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
  searchProducts: (query: string, filters?: SearchFilters) => Promise<VoiceSearchResult>;
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

  // Initialize data - try API first, fallback to mock data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Try to fetch all products from API using search endpoint
      console.log('🔄 Initializing marketplace data...');
      const response = await fetch('http://localhost:3001/api/search?q=');

      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ Fetched products from API:', apiData.products.length, 'products');

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
        throw new Error(`API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.warn('❌ Failed to fetch from API, using mock data:', error);
      // Fallback to mock data
      dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
      dispatch({ type: 'SET_SELLERS', payload: mockSellers });
      dispatch({ type: 'SET_OFFERS', payload: mockOffers });
      console.log('📦 Marketplace initialized with mock data');
    }
  };

  // Helper functions
  const searchProducts = async (query: string, filters: SearchFilters = {}): Promise<VoiceSearchResult> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Try to fetch from real API first
      console.log('🔍 Searching with query:', query, 'filters:', filters);
      const apiResult = await fetchFromSearchAPI(query, filters);

      if (apiResult) {
        console.log('✅ API Result received:', apiResult);
        const result: VoiceSearchResult = {
          query,
          products: apiResult.products.map(transformAPIProduct),
          filters,
          recommendations: apiResult.recommendations.map(transformAPIRecommendation),
          timestamp: new Date().toISOString(),
        };

        console.log('📊 Transformed result:', result);
        dispatch({ type: 'SET_SEARCH_RESULT', payload: result });
        return result;
      }

      // Fallback to enhanced fuzzy search with mock data
      console.log('API not available, using enhanced fuzzy search with mock data');

      // Apply spell correction to the query
      const correctedQuery = correctSpelling(query);
      console.log('🔤 Original query:', query, '→ Corrected:', correctedQuery);

      // Initialize fuzzy search engine
      const fuzzySearch = new FuzzySearchEngine({
        threshold: 0.2, // Lower threshold for more inclusive results
        keys: ['name', 'brand', 'description', 'tags'],
        shouldSort: true,
        includeScore: true,
      });

      // Apply category and price filters first
      let candidateProducts = state.products.filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category;
        const matchesPrice = !filters.priceRange ||
                           (product.basePrice >= filters.priceRange[0] && product.basePrice <= filters.priceRange[1]);
        const matchesBrand = !filters.brand || product.brand.toLowerCase() === filters.brand.toLowerCase();

        return matchesCategory && matchesPrice && matchesBrand;
      });

      // Use fuzzy search for text matching
      let filteredProducts: Product[] = [];
      if (correctedQuery.trim()) {
        const fuzzyResults = fuzzySearch.search(correctedQuery, candidateProducts);
        filteredProducts = fuzzyResults.map(result => result.item);
        console.log('🔍 Fuzzy search results:', fuzzyResults.length, 'matches');
      } else {
        // If no query, return all filtered products
        filteredProducts = candidateProducts;
      }

      // Generate recommendations from mock data
      const recommendations: ProductRecommendation[] = filteredProducts.slice(0, 3).map(product => {
        const offers = state.offers[product.id] || [];
        const bestOffer = offers.sort((a, b) => a.price - b.price)[0];
        const seller = state.sellers[bestOffer?.sellerId];

        return {
          product,
          bestOffer,
          seller,
          score: Math.random() * 100,
          reasons: ['Best price', 'Fast shipping', 'High seller rating'],
          savings: bestOffer ? product.basePrice - bestOffer.price : 0,
        };
      });

      const result: VoiceSearchResult = {
        query,
        products: filteredProducts,
        filters,
        recommendations,
        timestamp: new Date().toISOString(),
      };

      dispatch({ type: 'SET_SEARCH_RESULT', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Search failed' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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

      const apiUrl = `http://localhost:3001/api/search?${searchParams}`;
      console.log('🌐 Fetching from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);
      return data;
    } catch (error) {
      console.warn('❌ Search API not available:', error);
      console.warn('   Error details:', error.message);
      return null;
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
