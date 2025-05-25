export interface Product {
  id: string;
  name: string;
  category: 'electronics' | 'fashion' | 'beauty' | 'sneakers' | 'concert-tickets' | 'sports-tickets';
  brand: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  basePrice: number;
  averageRating: number;
  totalReviews: number;
  tags: string[];
  releaseDate?: string;
  isLimitedEdition: boolean;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface Seller {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  totalSales: number;
  location: string;
  verificationStatus: 'verified' | 'unverified';
  responseTime: string;
  memberSince: string;
  specialties: string[];
}

export interface SellerOffer {
  id: string;
  sellerId: string;
  productId: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  stockQuantity: number;
  shippingOptions: ShippingOption[];
  returnPolicy: ReturnPolicy;
  warranty?: Warranty;
  authenticity: AuthenticityInfo;
  lastUpdated: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
  carrier: string;
  tracking: boolean;
  insurance: boolean;
}

export interface ReturnPolicy {
  returnsAccepted: boolean;
  returnWindow: number; // days
  returnShipping: 'buyer-pays' | 'seller-pays' | 'free';
  restockingFee?: number;
  conditions: string[];
}

export interface Warranty {
  duration: number; // months
  type: 'manufacturer' | 'seller' | 'third-party';
  coverage: string[];
}

export interface AuthenticityInfo {
  guaranteed: boolean;
  verificationMethod?: string;
  certificate?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  offerId: string;
  quantity: number;
  selectedShipping: string;
  addedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumbers: Record<string, string>;
  estimatedDelivery: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  offerId: string;
  sellerId: string;
  quantity: number;
  price: number;
  shippingCost: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit-card' | 'debit-card' | 'paypal' | 'apple-pay' | 'google-pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export type OrderStatus =
  | 'pending-payment'
  | 'payment-confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface VoiceSearchResult {
  query: string;
  products: Product[];
  filters: SearchFilters;
  recommendations: ProductRecommendation[];
  timestamp: string;
}

export interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  brand?: string;
  size?: string;
  condition?: string;
  location?: string;
  shippingSpeed?: string;
}

export interface ProductRecommendation {
  product: Product;
  bestOffer: SellerOffer;
  seller: Seller;
  score: number;
  reasons: string[];
  savings?: number;
}

export interface MarketplaceState {
  products: Product[];
  sellers: Record<string, Seller>;
  offers: Record<string, SellerOffer[]>;
  cart: CartItem[];
  orders: Order[];
  currentSearch: VoiceSearchResult | null;
  loading: boolean;
  error: string | null;
}

export interface EmailNotification {
  id: string;
  userId: string;
  type: 'recommendations' | 'price-drop' | 'back-in-stock' | 'order-update';
  subject: string;
  content: string;
  recommendations?: ProductRecommendation[];
  sentAt: string;
  opened: boolean;
}

export interface CRMData {
  userId: string;
  searchHistory: VoiceSearchResult[];
  purchaseHistory: Order[];
  preferences: UserPreferences;
  behavior: UserBehavior;
  lastActivity: string;
}

export interface UserPreferences {
  favoriteCategories: string[];
  favoriteBrands: string[];
  priceRange: [number, number];
  preferredSellers: string[];
  shippingPreference: 'fastest' | 'cheapest' | 'most-reliable';
  notificationSettings: NotificationSettings;
}

export interface UserBehavior {
  totalSearches: number;
  totalPurchases: number;
  averageOrderValue: number;
  mostSearchedCategory: string;
  searchPatterns: Record<string, number>;
  conversionRate: number;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  priceDrops: boolean;
  newArrivals: boolean;
  orderUpdates: boolean;
}
