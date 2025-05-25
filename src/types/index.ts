export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  specifications: string[];
  preferredSize?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface UserPreferences {
  priceRange?: PriceRange;
  deliveryTimeframe?: string;
  prioritizePrice?: boolean;
  prioritizeSpeed?: boolean;
  prioritizeReputation?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  logo?: string;
  reputationScore: number;
  reviewCount: number;
  returnPolicy: string;
  returnPeriod: number;
  verified: boolean;
}

export interface Offer {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerLogo?: string;
  productId: string;
  price: number;
  currency: string;
  stock: number;
  estimatedDeliveryDays: number;
  reputationScore: number;
  returnPolicy: string;
  score?: number;
}

export interface RecommendationCriteria {
  price: number;
  deliverySpeed: number;
  sellerReputation: number;
  returnPolicy: number;
}

export interface Recommendation {
  offer: Offer;
  totalScore: number;
  priceScore: number;
  deliveryScore: number;
  reputationScore: number;
  returnPolicyScore: number;
}

export interface SearchState {
  status: 'idle' | 'listening' | 'processing' | 'results' | 'error';
  query?: string;
  product?: Product;
  preferences?: UserPreferences;
  offers?: Offer[];
  recommendations?: Recommendation[];
  error?: string;
}

export interface AppState {
  searchHistory: Array<{
    timestamp: number;
    query: string;
    product?: Product;
    recommendations?: Recommendation[];
  }>;
  savedDeals: Recommendation[];
  userPreferences: UserPreferences;
}