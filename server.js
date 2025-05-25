import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Indian Marketplace Products - Total: 30 products
const products = [
  // Electronics (10 products)
  {
    id: 'product_1',
    name: 'Apple iPhone 14 Pro Max',
    category: 'electronics',
    brand: 'Apple',
    description: 'Fast, premium and super smooth.',
    price: 129999,
    originalPrice: 139999,
    discount: 7,
    rating: 4.8,
    reviews: 1247,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center',
    tags: ['iphone', 'apple', 'smartphone', 'pro', 'premium'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'TechMart',
  },
  {
    id: 'product_2',
    name: 'Samsung Galaxy Buds Pro',
    category: 'electronics',
    brand: 'Samsung',
    description: 'Excellent sound with noise cancellation.',
    price: 11499,
    originalPrice: 12999,
    discount: 12,
    rating: 4.5,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&crop=center',
    tags: ['samsung', 'earbuds', 'wireless', 'noise cancellation', 'audio'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'AudioPoint',
  },
  {
    id: 'product_3',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'electronics',
    brand: 'Sony',
    description: 'Superb noise cancelling, ideal for travel.',
    price: 29990,
    originalPrice: 32990,
    discount: 9,
    rating: 4.7,
    reviews: 1534,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
    tags: ['sony', 'headphones', 'noise cancelling', 'wireless', 'travel'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'GadgetZilla',
  },
  {
    id: 'product_4',
    name: 'Apple MacBook Air M2',
    category: 'electronics',
    brand: 'Apple',
    description: 'Lightweight and very powerful.',
    price: 99990,
    originalPrice: 109990,
    discount: 9,
    rating: 4.9,
    reviews: 2156,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&crop=center',
    tags: ['macbook', 'apple', 'laptop', 'm2', 'lightweight'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'MacCorner',
  },
  {
    id: 'product_5',
    name: 'Lenovo Legion 5',
    category: 'electronics',
    brand: 'Lenovo',
    description: 'Runs AAA games smoothly.',
    price: 84990,
    originalPrice: 94990,
    discount: 11,
    rating: 4.6,
    reviews: 743,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop&crop=center',
    tags: ['lenovo', 'gaming', 'laptop', 'legion', 'performance'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'GameCentral',
  },
  {
    id: 'product_6',
    name: 'LG 55" OLED Smart TV',
    category: 'electronics',
    brand: 'LG',
    description: 'Stunning visuals and great interface.',
    price: 114990,
    originalPrice: 124990,
    discount: 8,
    rating: 4.8,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center',
    tags: ['lg', 'oled', 'smart tv', '55 inch', 'premium'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'HomeVision',
  },
  {
    id: 'product_7',
    name: 'Canon EOS R10',
    category: 'electronics',
    brand: 'Canon',
    description: 'Perfect for beginners and pros.',
    price: 79999,
    originalPrice: 84999,
    discount: 6,
    rating: 4.5,
    reviews: 423,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop&crop=center',
    tags: ['canon', 'camera', 'mirrorless', 'photography', 'eos'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'CamZone',
  },
  {
    id: 'product_8',
    name: 'Xiaomi Mi Smart Band 8',
    category: 'electronics',
    brand: 'Xiaomi',
    description: 'Value for money with loads of features.',
    price: 3499,
    originalPrice: 3999,
    discount: 13,
    rating: 4.3,
    reviews: 1876,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop&crop=center',
    tags: ['xiaomi', 'smart band', 'fitness', 'health', 'wearable'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'FitTech',
  },
  {
    id: 'product_9',
    name: 'JBL Flip 6 Speaker',
    category: 'electronics',
    brand: 'JBL',
    description: 'Loud and punchy sound!',
    price: 8999,
    originalPrice: 9999,
    discount: 10,
    rating: 4.6,
    reviews: 934,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center',
    tags: ['jbl', 'speaker', 'bluetooth', 'portable', 'bass'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'SoundHub',
  },
  {
    id: 'product_10',
    name: 'Amazon Echo Dot (5th Gen)',
    category: 'electronics',
    brand: 'Amazon',
    description: 'Smart and helpful daily assistant.',
    price: 5499,
    originalPrice: 5999,
    discount: 8,
    rating: 4.4,
    reviews: 2341,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop&crop=center',
    tags: ['amazon', 'echo', 'alexa', 'smart speaker', 'voice assistant'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'EComWorld',
  },
  // Fashion & Footwear (10 products)
  {
    id: 'product_11',
    name: 'Nike Air Force 1',
    category: 'fashion',
    brand: 'Nike',
    description: 'Classic and stylish.',
    price: 7495,
    originalPrice: 7995,
    discount: 6,
    rating: 4.7,
    reviews: 1834,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
    tags: ['nike', 'air force', 'classic', 'basketball', 'white'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'KicksKart',
  },
  {
    id: 'product_12',
    name: 'Adidas Ultraboost 22',
    category: 'fashion',
    brand: 'Adidas',
    description: 'Comfort like no other.',
    price: 11999,
    originalPrice: 12999,
    discount: 8,
    rating: 4.8,
    reviews: 1245,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
    tags: ['adidas', 'ultraboost', 'running', 'comfort', 'boost'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'ShoeSpot',
  },
  {
    id: 'product_13',
    name: 'Puma Running Shoes',
    category: 'fashion',
    brand: 'Puma',
    description: 'Affordable and comfy.',
    price: 3499,
    originalPrice: 3999,
    discount: 13,
    rating: 4.5,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop&crop=center',
    tags: ['puma', 'running', 'affordable', 'comfort', 'sports'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'SportyFeet',
  },
  {
    id: 'product_14',
    name: 'Levi\'s 511 Slim Fit Jeans',
    category: 'fashion',
    brand: 'Levi\'s',
    description: 'Great fit, great quality.',
    price: 3799,
    originalPrice: 4199,
    discount: 10,
    rating: 4.6,
    reviews: 1567,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center',
    tags: ['levis', 'jeans', 'slim fit', 'denim', 'classic'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'DenimWorld',
  },
  {
    id: 'product_15',
    name: 'Zara Oversized Hoodie',
    category: 'fashion',
    brand: 'Zara',
    description: 'Warm and trendy.',
    price: 2299,
    originalPrice: 2599,
    discount: 12,
    rating: 4.4,
    reviews: 743,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center',
    tags: ['zara', 'hoodie', 'oversized', 'casual', 'trendy'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'StyleMe',
  },
  {
    id: 'product_16',
    name: 'Uniqlo AIRism Tee',
    category: 'fashion',
    brand: 'Uniqlo',
    description: 'Soft and breathable.',
    price: 999,
    originalPrice: 1199,
    discount: 17,
    rating: 4.2,
    reviews: 1456,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
    tags: ['uniqlo', 'airism', 'tee', 'breathable', 'comfort'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'WearWell',
  },
  {
    id: 'product_17',
    name: 'H&M Cotton Chinos',
    category: 'fashion',
    brand: 'H&M',
    description: 'Looks good and fits right.',
    price: 2199,
    originalPrice: 2499,
    discount: 12,
    rating: 4.3,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop&crop=center',
    tags: ['hm', 'chinos', 'cotton', 'casual', 'smart'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'TrendHub',
  },
  {
    id: 'product_18',
    name: 'Ray-Ban Aviators',
    category: 'fashion',
    brand: 'Ray-Ban',
    description: 'Stylish and premium feel.',
    price: 6490,
    originalPrice: 6990,
    discount: 7,
    rating: 4.6,
    reviews: 1234,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center',
    tags: ['rayban', 'aviators', 'sunglasses', 'classic', 'premium'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'VisionMart',
  },
  {
    id: 'product_19',
    name: 'Fossil Gen 6 Watch',
    category: 'fashion',
    brand: 'Fossil',
    description: 'Looks good with long battery.',
    price: 18495,
    originalPrice: 19995,
    discount: 8,
    rating: 4.5,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
    tags: ['fossil', 'smartwatch', 'gen 6', 'battery', 'classic'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'WatchVault',
  },
  {
    id: 'product_20',
    name: 'Casio G-Shock GA-2100',
    category: 'fashion',
    brand: 'Casio',
    description: 'Tough and fashionable.',
    price: 7599,
    originalPrice: 7999,
    discount: 5,
    rating: 4.7,
    reviews: 1123,
    image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&h=400&fit=crop&crop=center',
    tags: ['casio', 'gshock', 'tough', 'fashionable', 'durable'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'TimeSquare',
  },
  // Beauty & Personal Care (10 products)
  {
    id: 'product_21',
    name: 'L\'Oréal Revitalift Serum',
    category: 'beauty',
    brand: 'L\'Oréal',
    description: 'Firmer skin in weeks.',
    price: 1099,
    originalPrice: 1299,
    discount: 15,
    rating: 4.5,
    reviews: 1876,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
    tags: ['loreal', 'serum', 'anti-aging', 'skincare', 'revitalift'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'GlowStore',
  },
  {
    id: 'product_22',
    name: 'Neutrogena Hydro Boost',
    category: 'beauty',
    brand: 'Neutrogena',
    description: 'Hydrates without oiliness.',
    price: 849,
    originalPrice: 999,
    discount: 15,
    rating: 4.6,
    reviews: 2134,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&crop=center',
    tags: ['neutrogena', 'moisturizer', 'hydro boost', 'hydrating', 'lightweight'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'DermaCare',
  },
  {
    id: 'product_23',
    name: 'Gillette Fusion Razor',
    category: 'beauty',
    brand: 'Gillette',
    description: 'Smooth and easy shave.',
    price: 499,
    originalPrice: 599,
    discount: 17,
    rating: 4.3,
    reviews: 2456,
    image: 'https://images.unsplash.com/photo-1499728603263-13726abce5ca?w=400&h=400&fit=crop&crop=center',
    tags: ['gillette', 'razor', 'shaving', 'fusion', 'smooth'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'ShaveIt',
  },
  {
    id: 'product_24',
    name: 'Maybelline Fit Me Foundation',
    category: 'beauty',
    brand: 'Maybelline',
    description: 'Natural finish and great shade range.',
    price: 549,
    originalPrice: 649,
    discount: 15,
    rating: 4.4,
    reviews: 1834,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
    tags: ['maybelline', 'foundation', 'fit me', 'natural', 'makeup'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'BeautyMart',
  },
  {
    id: 'product_25',
    name: 'Mamaearth Ubtan Face Wash',
    category: 'beauty',
    brand: 'Mamaearth',
    description: 'Gentle and refreshing.',
    price: 249,
    originalPrice: 299,
    discount: 17,
    rating: 4.2,
    reviews: 1567,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center',
    tags: ['mamaearth', 'ubtan', 'face wash', 'natural', 'gentle'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'NatureRoot',
  },
  {
    id: 'product_26',
    name: 'Nivea Body Lotion',
    category: 'beauty',
    brand: 'Nivea',
    description: 'Keeps skin moisturized all day.',
    price: 329,
    originalPrice: 399,
    discount: 18,
    rating: 4.3,
    reviews: 2134,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center',
    tags: ['nivea', 'body lotion', 'moisturizer', 'daily care', 'hydrating'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'FreshKart',
  },
  {
    id: 'product_27',
    name: 'Philips Beard Trimmer',
    category: 'beauty',
    brand: 'Philips',
    description: 'Precise and long-lasting battery.',
    price: 1499,
    originalPrice: 1799,
    discount: 17,
    rating: 4.5,
    reviews: 1245,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&crop=center',
    tags: ['philips', 'beard trimmer', 'grooming', 'precision', 'battery'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'GroomBuddy',
  },
  {
    id: 'product_28',
    name: 'Dyson Airwrap',
    category: 'beauty',
    brand: 'Dyson',
    description: 'Game-changer for styling.',
    price: 44900,
    originalPrice: 49900,
    discount: 10,
    rating: 4.8,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop&crop=center',
    tags: ['dyson', 'airwrap', 'hair styling', 'premium', 'technology'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'HairPro',
  },
  {
    id: 'product_29',
    name: 'Dove Intense Repair Shampoo',
    category: 'beauty',
    brand: 'Dove',
    description: 'Reduces hair breakage.',
    price: 299,
    originalPrice: 349,
    discount: 14,
    rating: 4.2,
    reviews: 1876,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
    tags: ['dove', 'shampoo', 'hair care', 'repair', 'breakage'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'CareNest',
  },
  {
    id: 'product_30',
    name: 'The Ordinary Niacinamide 10%',
    category: 'beauty',
    brand: 'The Ordinary',
    description: 'Great for acne-prone skin.',
    price: 599,
    originalPrice: 699,
    discount: 14,
    rating: 4.7,
    reviews: 3456,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&crop=center',
    tags: ['the ordinary', 'niacinamide', 'acne', 'vitamin', 'zinc'],
    inStock: true,
    fastShipping: true,
    freeReturns: true,
    seller: 'SkinLabs',
  },
];

// Search endpoint
app.get('/api/search', (req, res) => {
  const {
    q,
    category,
    brand,
    min_price,
    max_price,
    sort_by = 'relevance',
    sort_order = 'desc',
    fast_shipping,
    free_returns
  } = req.query;

  console.log('Search request:', req.query);

  let filteredProducts = [...products];

  // Text search
  if (q) {
    const searchTerm = q.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Category filter
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(product =>
      product.category === category
    );
  }

  // Brand filter
  if (brand) {
    filteredProducts = filteredProducts.filter(product =>
      product.brand.toLowerCase() === brand.toLowerCase()
    );
  }

  // Price range filter
  if (min_price) {
    filteredProducts = filteredProducts.filter(product =>
      product.price >= parseInt(min_price)
    );
  }
  if (max_price) {
    filteredProducts = filteredProducts.filter(product =>
      product.price <= parseInt(max_price)
    );
  }

  // Shipping filters
  if (fast_shipping === 'true') {
    filteredProducts = filteredProducts.filter(product => product.fastShipping);
  }
  if (free_returns === 'true') {
    filteredProducts = filteredProducts.filter(product => product.freeReturns);
  }

  // Sorting
  switch (sort_by) {
    case 'price':
      filteredProducts.sort((a, b) =>
        sort_order === 'asc' ? a.price - b.price : b.price - a.price
      );
      break;
    case 'rating':
      filteredProducts.sort((a, b) =>
        sort_order === 'asc' ? a.rating - b.rating : b.rating - a.rating
      );
      break;
    case 'reviews':
      filteredProducts.sort((a, b) =>
        sort_order === 'asc' ? a.reviews - b.reviews : b.reviews - a.reviews
      );
      break;
    default: // relevance
      // Keep original order for relevance
      break;
  }

  // Generate recommendations (top 3 products)
  const recommendations = filteredProducts.slice(0, 3).map(product => ({
    product,
    score: Math.random() * 100,
    reasons: [
      'Best price in category',
      'High customer rating',
      'Fast shipping available',
      'Free returns accepted'
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    savings: product.originalPrice ? product.originalPrice - product.price : 0,
  }));

  const response = {
    query: q || '',
    total: filteredProducts.length,
    products: filteredProducts,
    recommendations,
    filters: {
      category,
      brand,
      min_price,
      max_price,
      sort_by,
      sort_order,
      fast_shipping,
      free_returns,
    },
    timestamp: new Date().toISOString(),
  };

  console.log(`Returning ${filteredProducts.length} products`);
  res.json(response);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Search API server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /api/search - Search products`);
  console.log(`   GET /api/health - Health check`);
  console.log(`\n🔍 Example search: http://localhost:${PORT}/api/search?q=nike&category=sneakers&max_price=500`);
});

export default app;
