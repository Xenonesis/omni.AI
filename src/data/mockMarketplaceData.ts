import { Product, Seller, SellerOffer } from '../types/marketplace';

// Mock Sellers
export const mockSellers: Record<string, Seller> = {
  'seller_1': {
    id: 'seller_1',
    name: 'TechMart',
    logo: 'https://via.placeholder.com/100x100?text=TM',
    rating: 4.8,
    totalSales: 15420,
    location: 'Mumbai, India',
    verificationStatus: 'verified',
    responseTime: '< 1 hour',
    memberSince: '2019-03-15',
    specialties: ['Premium Electronics', 'Apple Products', 'Latest Gadgets'],
  },
  'seller_2': {
    id: 'seller_2',
    name: 'GadgetZilla',
    logo: 'https://via.placeholder.com/100x100?text=GZ',
    rating: 4.7,
    totalSales: 12350,
    location: 'Delhi, India',
    verificationStatus: 'verified',
    responseTime: '< 30 minutes',
    memberSince: '2020-01-10',
    specialties: ['Audio Equipment', 'Headphones', 'Smart Devices'],
  },
  'seller_3': {
    id: 'seller_3',
    name: 'KicksKart',
    logo: 'https://via.placeholder.com/100x100?text=KK',
    rating: 4.7,
    totalSales: 8930,
    location: 'Bangalore, India',
    verificationStatus: 'verified',
    responseTime: '< 45 minutes',
    memberSince: '2021-06-20',
    specialties: ['Branded Footwear', 'Nike Collection', 'Sports Shoes'],
  },
  'seller_4': {
    id: 'seller_4',
    name: 'StyleMe',
    logo: 'https://via.placeholder.com/100x100?text=SM',
    rating: 4.5,
    totalSales: 6540,
    location: 'Chennai, India',
    verificationStatus: 'verified',
    responseTime: '< 2 hours',
    memberSince: '2022-11-05',
    specialties: ['Fashion Apparel', 'Trendy Clothing', 'Casual Wear'],
  },
  'seller_5': {
    id: 'seller_5',
    name: 'GlowStore',
    logo: 'https://via.placeholder.com/100x100?text=GS',
    rating: 4.6,
    totalSales: 4320,
    location: 'Pune, India',
    verificationStatus: 'verified',
    responseTime: '< 30 minutes',
    memberSince: '2020-08-12',
    specialties: ['Beauty Products', 'Skincare', 'Cosmetics'],
  },
};

// Mock Products - Electronics
const electronicsProducts: Product[] = [
  {
    id: 'product_1',
    name: 'Apple iPhone 14 Pro Max',
    category: 'electronics',
    brand: 'Apple',
    description: 'Fast, premium and super smooth. The ultimate iPhone experience with Pro camera system.',
    specifications: {
      'Storage': '128GB, 256GB, 512GB, 1TB',
      'Display': '6.7-inch Super Retina XDR',
      'Chip': 'A16 Bionic',
      'Camera': 'Pro camera system',
      'Battery': 'Up to 29 hours video playback',
    },
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center',
    ],
    basePrice: 129999,
    averageRating: 4.8,
    totalReviews: 1247,
    tags: ['iphone', 'apple', 'smartphone', 'pro', 'premium'],
    releaseDate: '2022-09-16',
    isLimitedEdition: false,
    stockStatus: 'in-stock',
  },
  {
    id: 'product_2',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'electronics',
    brand: 'Sony',
    description: 'Superb noise cancelling, ideal for travel. Industry-leading wireless headphones.',
    specifications: {
      'Type': 'Over-ear wireless',
      'Battery Life': 'Up to 30 hours',
      'Noise Cancelling': 'Industry-leading',
      'Connectivity': 'Bluetooth 5.2',
      'Weight': '250g',
    },
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
    ],
    basePrice: 29990,
    averageRating: 4.7,
    totalReviews: 1534,
    tags: ['sony', 'headphones', 'noise cancelling', 'wireless', 'travel'],
    releaseDate: '2022-05-12',
    isLimitedEdition: false,
    stockStatus: 'in-stock',
  },
  {
    id: 'product_3',
    name: 'Apple MacBook Air M2',
    category: 'electronics',
    brand: 'Apple',
    description: 'Lightweight and very powerful. The perfect laptop for work and creativity.',
    specifications: {
      'Chip': 'Apple M2',
      'Display': '13.6-inch Liquid Retina',
      'Memory': '8GB, 16GB, 24GB',
      'Storage': '256GB, 512GB, 1TB, 2TB',
      'Weight': '1.24 kg',
    },
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center',
    ],
    basePrice: 99990,
    averageRating: 4.9,
    totalReviews: 2156,
    tags: ['macbook', 'apple', 'laptop', 'm2', 'lightweight'],
    releaseDate: '2022-07-15',
    isLimitedEdition: false,
    stockStatus: 'in-stock',
  },
];

// Mock Products - Fashion & Footwear
const fashionProducts: Product[] = [
  {
    id: 'product_4',
    name: 'Nike Air Force 1',
    category: 'fashion',
    brand: 'Nike',
    description: 'Classic and stylish. The iconic basketball shoe that never goes out of style.',
    specifications: {
      'Size Range': '6-13',
      'Colorway': 'White/White',
      'Material': 'Leather Upper',
      'Style': 'Low-top',
      'Closure': 'Lace-up',
    },
    images: [
      'https://via.placeholder.com/400x400?text=Nike+Air+Force+1',
      'https://via.placeholder.com/400x400?text=Side+View',
      'https://via.placeholder.com/400x400?text=Top+View',
    ],
    basePrice: 7495,
    averageRating: 4.7,
    totalReviews: 1834,
    tags: ['nike', 'air force', 'classic', 'basketball', 'white'],
    releaseDate: '1982-01-01',
    isLimitedEdition: false,
    stockStatus: 'in-stock',
  },
  {
    id: 'product_5',
    name: 'Adidas Ultraboost 22',
    category: 'fashion',
    brand: 'Adidas',
    description: 'Comfort like no other. Premium running shoes with responsive cushioning.',
    specifications: {
      'Size Range': '6-13',
      'Technology': 'Boost midsole',
      'Upper': 'Primeknit',
      'Purpose': 'Running',
      'Drop': '10mm',
    },
    images: [
      'https://via.placeholder.com/400x400?text=Ultraboost+22',
      'https://via.placeholder.com/400x400?text=Side+View',
      'https://via.placeholder.com/400x400?text=Sole+View',
    ],
    basePrice: 11999,
    averageRating: 4.8,
    totalReviews: 1245,
    tags: ['adidas', 'ultraboost', 'running', 'comfort', 'boost'],
    releaseDate: '2022-02-01',
    isLimitedEdition: false,
    stockStatus: 'in-stock',
  },
];

// Mock Products - Beauty & Personal Care
const beautyProducts: Product[] = [
  {
    id: 'product_6',
    name: 'L\'Oréal Revitalift Serum',
    category: 'beauty',
    brand: 'L\'Oréal',
    description: 'Firmer skin in weeks. Advanced anti-aging serum with proven results.',
    specifications: {
      'Volume': '30ml',
      'Skin Type': 'All skin types',
      'Key Ingredient': 'Pro-Retinol',
      'Usage': 'Day and night',
      'Benefits': 'Anti-aging, firming',
    },
    images: [
      'https://via.placeholder.com/400x400?text=Loreal+Serum',
      'https://via.placeholder.com/400x400?text=Product+View',
      'https://via.placeholder.com/400x400?text=Texture+View',
    ],
    basePrice: 1099,
    averageRating: 4.5,
    totalReviews: 1876,
    tags: ['loreal', 'serum', 'anti-aging', 'skincare', 'revitalift'],
    releaseDate: '2023-01-15',
    isLimitedEdition: false,
    stockStatus: 'low-stock',
  },
];

export const mockProducts: Product[] = [
  ...electronicsProducts,
  ...fashionProducts,
  ...beautyProducts,
];

// Generate mock offers for each product
export const mockOffers: Record<string, SellerOffer[]> = {};

mockProducts.forEach(product => {
  const numOffers = Math.floor(Math.random() * 3) + 5; // 5-7 offers per product
  const offers: SellerOffer[] = [];

  for (let i = 0; i < numOffers; i++) {
    const sellerIds = Object.keys(mockSellers);
    const sellerId = sellerIds[Math.floor(Math.random() * sellerIds.length)];
    const priceVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
    const price = Math.round(product.basePrice * (1 + priceVariation));

    offers.push({
      id: `offer_${product.id}_${i}`,
      sellerId,
      productId: product.id,
      price,
      originalPrice: price > product.basePrice ? price : undefined,
      discount: price < product.basePrice ? Math.round(((product.basePrice - price) / product.basePrice) * 100) : undefined,
      condition: ['new', 'like-new', 'good'][Math.floor(Math.random() * 3)] as any,
      stockQuantity: Math.floor(Math.random() * 10) + 1,
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
        {
          id: 'express',
          name: 'Express Shipping',
          price: 15,
          estimatedDays: 2,
          carrier: 'FedEx',
          tracking: true,
          insurance: true,
        },
      ],
      returnPolicy: {
        returnsAccepted: true,
        returnWindow: 30,
        returnShipping: 'buyer-pays',
        conditions: ['Item must be in original condition', 'Original packaging required'],
      },
      authenticity: {
        guaranteed: Math.random() > 0.3,
        verificationMethod: 'Third-party authentication',
        certificate: 'AUTH-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      },
      lastUpdated: new Date().toISOString(),
    });
  }

  mockOffers[product.id] = offers.sort((a, b) => a.price - b.price);
});
