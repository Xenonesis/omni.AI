#!/usr/bin/env node

/**
 * 🚀 omniverse.AI API Server
 *
 * Express.js server providing voice shopping API endpoints
 * with comprehensive Indian product catalog and NLP processing
 */

const express = require("express");
const cors = require("cors");
const natural = require("natural");
const compromise = require("compromise");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:4173",
      "https://omniverseai.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced Indian Product Catalog
const INDIAN_PRODUCTS = [
  // Electronics
  {
    id: "iphone-14-pro-max",
    name: "iPhone 14 Pro Max",
    category: "electronics",
    subcategory: "smartphones",
    brand: "Apple",
    price: 129999,
    originalPrice: 139999,
    currency: "INR",
    rating: 4.8,
    reviews: 15420,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    description:
      "Latest iPhone with A16 Bionic chip, Pro camera system, and Dynamic Island",
    seller: "Apple Store India",
    inStock: true,
    fastDelivery: true,
    tags: ["smartphone", "apple", "premium", "camera", "5g"],
    specifications: {
      display: "6.7-inch Super Retina XDR",
      storage: "128GB",
      camera: "48MP Pro camera system",
      battery: "Up to 29 hours video playback",
    },
  },
  {
    id: "macbook-air-m2",
    name: "MacBook Air M2",
    category: "electronics",
    subcategory: "laptops",
    brand: "Apple",
    price: 99990,
    originalPrice: 119900,
    currency: "INR",
    rating: 4.9,
    reviews: 8750,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
    description: "Supercharged by M2 chip, 13.6-inch Liquid Retina display",
    seller: "Apple Authorized Reseller",
    inStock: true,
    fastDelivery: true,
    tags: ["laptop", "apple", "ultrabook", "m2", "productivity"],
    specifications: {
      processor: "Apple M2 chip",
      memory: "8GB unified memory",
      storage: "256GB SSD",
      display: "13.6-inch Liquid Retina",
    },
  },
  {
    id: "samsung-galaxy-s23-ultra",
    name: "Samsung Galaxy S23 Ultra",
    category: "electronics",
    subcategory: "smartphones",
    brand: "Samsung",
    price: 124999,
    originalPrice: 134999,
    currency: "INR",
    rating: 4.7,
    reviews: 12300,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
    description: "200MP camera, S Pen included, 5000mAh battery",
    seller: "Samsung India",
    inStock: true,
    fastDelivery: true,
    tags: ["smartphone", "samsung", "camera", "spen", "android"],
    specifications: {
      display: "6.8-inch Dynamic AMOLED 2X",
      storage: "256GB",
      camera: "200MP main camera",
      battery: "5000mAh",
    },
  },

  // Fashion
  {
    id: "nike-air-force-1",
    name: "Nike Air Force 1 '07",
    category: "fashion",
    subcategory: "shoes",
    brand: "Nike",
    price: 7495,
    originalPrice: 8995,
    currency: "INR",
    rating: 4.6,
    reviews: 5420,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    description: "Classic white leather sneakers, iconic basketball style",
    seller: "Nike India",
    inStock: true,
    fastDelivery: true,
    tags: ["shoes", "sneakers", "nike", "white", "classic"],
    specifications: {
      material: "Leather upper",
      sole: "Rubber outsole",
      closure: "Lace-up",
      style: "Low-top",
    },
  },
  {
    id: "levis-511-jeans",
    name: "Levi's 511 Slim Jeans",
    category: "fashion",
    subcategory: "clothing",
    brand: "Levi's",
    price: 3799,
    originalPrice: 4999,
    currency: "INR",
    rating: 4.4,
    reviews: 3200,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    description: "Slim fit jeans with stretch, dark wash",
    seller: "Levi's Store",
    inStock: true,
    fastDelivery: false,
    tags: ["jeans", "levis", "slim", "denim", "casual"],
    specifications: {
      fit: "Slim",
      material: "99% Cotton, 1% Elastane",
      wash: "Dark indigo",
      rise: "Mid-rise",
    },
  },

  // Beauty & Personal Care
  {
    id: "loreal-hyaluronic-acid-serum",
    name: "L'Oréal Hyaluronic Acid Serum",
    category: "beauty",
    subcategory: "skincare",
    brand: "L'Oréal",
    price: 1099,
    originalPrice: 1299,
    currency: "INR",
    rating: 4.3,
    reviews: 2100,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    description: "Intense hydration serum with 1.5% Hyaluronic Acid",
    seller: "L'Oréal Paris India",
    inStock: true,
    fastDelivery: true,
    tags: ["skincare", "serum", "hyaluronic", "hydration", "anti-aging"],
    specifications: {
      volume: "30ml",
      skinType: "All skin types",
      keyIngredient: "Hyaluronic Acid 1.5%",
      usage: "Morning and evening",
    },
  },
  {
    id: "dyson-airwrap",
    name: "Dyson Airwrap Complete",
    category: "beauty",
    subcategory: "hair-tools",
    brand: "Dyson",
    price: 44900,
    originalPrice: 49900,
    currency: "INR",
    rating: 4.8,
    reviews: 890,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
    description: "Multi-styler for curls, waves, and smooth styles",
    seller: "Dyson India",
    inStock: true,
    fastDelivery: true,
    tags: ["hair-styling", "dyson", "airwrap", "premium", "multi-styler"],
    specifications: {
      attachments: "6 styling attachments",
      technology: "Coanda airflow",
      heatSettings: "3 heat settings",
      warranty: "2 years",
    },
  },
];

// NLP Setup
const stemmer = natural.PorterStemmer;
const tokenizer = new natural.WordTokenizer();

// Helper Functions
function normalizeQuery(query) {
  if (!query) return "";
  return query.toLowerCase().trim();
}

function extractSearchTerms(query) {
  const doc = compromise(query);

  // Extract brands, products, categories
  const brands = ["apple", "samsung", "nike", "levis", "loreal", "dyson"];
  const categories = [
    "electronics",
    "fashion",
    "beauty",
    "smartphones",
    "laptops",
    "shoes",
    "clothing",
  ];

  const terms = {
    brands: brands.filter((brand) => query.toLowerCase().includes(brand)),
    categories: categories.filter((cat) => query.toLowerCase().includes(cat)),
    priceRange: extractPriceRange(query),
    keywords: tokenizer.tokenize(query.toLowerCase()),
  };

  return terms;
}

function extractPriceRange(query) {
  const priceRegex =
    /(?:under|below|less than|up to)\s*(?:rs\.?|rupees?|₹)?\s*(\d+(?:,\d+)*)/i;
  const match = query.match(priceRegex);

  if (match) {
    const maxPrice = parseInt(match[1].replace(/,/g, ""));
    return { max: maxPrice };
  }

  return null;
}

function calculateRelevanceScore(product, terms) {
  let score = 0;

  // Brand match (high weight)
  if (
    terms.brands.some((brand) => product.brand.toLowerCase().includes(brand))
  ) {
    score += 50;
  }

  // Category match
  if (
    terms.categories.some(
      (cat) =>
        product.category.includes(cat) || product.subcategory.includes(cat)
    )
  ) {
    score += 30;
  }

  // Keyword matches in name and description
  const productText = `${product.name} ${
    product.description
  } ${product.tags.join(" ")}`.toLowerCase();
  terms.keywords.forEach((keyword) => {
    if (productText.includes(keyword)) {
      score += 10;
    }
  });

  // Price range match
  if (
    terms.priceRange &&
    terms.priceRange.max &&
    product.price <= terms.priceRange.max
  ) {
    score += 20;
  }

  // Rating boost
  score += product.rating * 2;

  return score;
}

function searchProducts(query, filters = {}) {
  const normalizedQuery = normalizeQuery(query);
  const terms = extractSearchTerms(normalizedQuery);

  let results = INDIAN_PRODUCTS;

  // Apply filters
  if (filters.category) {
    results = results.filter((p) => p.category === filters.category);
  }

  if (filters.brand) {
    results = results.filter(
      (p) => p.brand.toLowerCase() === filters.brand.toLowerCase()
    );
  }

  if (filters.min_price) {
    results = results.filter((p) => p.price >= parseInt(filters.min_price));
  }

  if (filters.max_price) {
    results = results.filter((p) => p.price <= parseInt(filters.max_price));
  }

  if (filters.rating) {
    results = results.filter((p) => p.rating >= parseFloat(filters.rating));
  }

  if (filters.in_stock) {
    results = results.filter((p) => p.inStock);
  }

  // Calculate relevance scores and sort
  if (normalizedQuery) {
    results = results
      .map((product) => ({
        ...product,
        relevanceScore: calculateRelevanceScore(product, terms),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Apply sorting
  if (filters.sort_by) {
    switch (filters.sort_by) {
      case "price_low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        results.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        results.sort((a, b) => b.reviews - a.reviews);
        break;
    }
  }

  return results;
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "3.2.0",
    services: {
      nlp: "active",
      search: "active",
      voice: "active",
    },
  });
});

// Search products
app.get("/api/search", (req, res) => {
  try {
    const { q: query, ...filters } = req.query;
    const results = searchProducts(query, filters);

    res.json({
      success: true,
      query: query || "",
      filters,
      total: results.length,
      products: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Search failed",
      message: error.message,
    });
  }
});

// Get product by ID
app.get("/api/products/:id", (req, res) => {
  try {
    const product = INDIAN_PRODUCTS.find((p) => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
      message: error.message,
    });
  }
});

// Get categories
app.get("/api/categories", (req, res) => {
  try {
    const categories = [...new Set(INDIAN_PRODUCTS.map((p) => p.category))];
    const subcategories = [
      ...new Set(INDIAN_PRODUCTS.map((p) => p.subcategory)),
    ];
    const brands = [...new Set(INDIAN_PRODUCTS.map((p) => p.brand))];

    res.json({
      success: true,
      categories,
      subcategories,
      brands,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
      message: error.message,
    });
  }
});

// Voice search endpoint
app.post("/api/voice-search", (req, res) => {
  try {
    const { transcript, context } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: "Transcript is required",
      });
    }

    // Process voice command
    const results = searchProducts(transcript);

    // Generate voice response
    const responseText =
      results.length > 0
        ? `Found ${results.length} products matching "${transcript}". The top result is ${results[0].name} for ₹${results[0].price}.`
        : `Sorry, I couldn't find any products matching "${transcript}". Try searching for electronics, fashion, or beauty products.`;

    res.json({
      success: true,
      transcript,
      results: results.slice(0, 10), // Limit to top 10
      response: responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Voice search error:", error);
    res.status(500).json({
      success: false,
      error: "Voice search failed",
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `${req.method} ${req.path} is not a valid endpoint`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 omniverse.AI API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search`);
  console.log(`🎤 Voice API: http://localhost:${PORT}/api/voice-search`);
  console.log(`📦 Products: ${INDIAN_PRODUCTS.length} items loaded`);
});

module.exports = app;
