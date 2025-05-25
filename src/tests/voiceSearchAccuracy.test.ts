/**
 * Voice Search Accuracy Tests
 * Comprehensive test suite to validate voice search functionality with real marketplace data
 */

import { nlpService } from '../services/nlpService';
import { FuzzySearchEngine, correctSpelling, soundsLike, calculateSimilarity } from '../utils/fuzzySearch';

// Mock product data for testing
const testProducts = [
  {
    id: 'test_1',
    name: 'Apple iPhone 14 Pro Max',
    brand: 'Apple',
    category: 'electronics',
    description: 'Fast, premium and super smooth.',
    tags: ['iphone', 'apple', 'smartphone', 'pro', 'premium'],
    basePrice: 129999,
  },
  {
    id: 'test_2',
    name: 'Samsung Galaxy Buds Pro',
    brand: 'Samsung',
    category: 'electronics',
    description: 'Excellent sound with noise cancellation.',
    tags: ['samsung', 'earbuds', 'wireless', 'noise cancellation', 'audio'],
    basePrice: 11499,
  },
  {
    id: 'test_3',
    name: 'Nike Air Force 1',
    brand: 'Nike',
    category: 'fashion',
    description: 'Classic and stylish basketball shoe.',
    tags: ['nike', 'shoes', 'sneakers', 'basketball', 'classic'],
    basePrice: 7999,
  },
  {
    id: 'test_4',
    name: 'L\'Oreal Paris Revitalift Serum',
    brand: 'L\'Oreal',
    category: 'beauty',
    description: 'Anti-aging serum for youthful skin.',
    tags: ['loreal', 'serum', 'anti-aging', 'skincare', 'revitalift'],
    basePrice: 1099,
  },
];

// Test cases for voice search accuracy
const testCases = [
  // Exact matches
  {
    query: 'iPhone 14 Pro Max',
    expectedBrand: 'Apple',
    expectedCategory: 'electronics',
    expectedProduct: 'iPhone',
    description: 'Exact product name match'
  },
  
  // Brand searches
  {
    query: 'Samsung earbuds',
    expectedBrand: 'Samsung',
    expectedCategory: 'electronics',
    expectedProduct: 'earbuds',
    description: 'Brand + product type'
  },
  
  // Category searches
  {
    query: 'Nike shoes',
    expectedBrand: 'Nike',
    expectedCategory: 'fashion',
    expectedProduct: 'shoes',
    description: 'Brand + category'
  },
  
  // Misspellings
  {
    query: 'aple iphone',
    expectedBrand: 'Apple',
    expectedProduct: 'iphone',
    description: 'Misspelled brand name'
  },
  
  // Phonetic variations
  {
    query: 'samsang galaxy',
    expectedBrand: 'Samsung',
    expectedProduct: 'galaxy',
    description: 'Phonetic brand variation'
  },
  
  // Indian English variations
  {
    query: 'mobile phone under 50000',
    expectedCategory: 'electronics',
    expectedPriceRange: { max: 50000 },
    description: 'Indian price format with category'
  },
  
  // Mixed language
  {
    query: 'beauty products for face',
    expectedCategory: 'beauty',
    description: 'Beauty category search'
  },
  
  // Price queries with Indian currency
  {
    query: 'shoes under Rs 10000',
    expectedCategory: 'fashion',
    expectedPriceRange: { max: 10000 },
    description: 'Price query with Indian currency'
  },
  
  // Casual speech patterns
  {
    query: 'show me some nike sneakers',
    expectedBrand: 'Nike',
    expectedProduct: 'sneakers',
    description: 'Casual speech pattern'
  },
  
  // Complex queries
  {
    query: 'find samsung wireless earbuds under 15000',
    expectedBrand: 'Samsung',
    expectedProduct: 'earbuds',
    expectedPriceRange: { max: 15000 },
    description: 'Complex multi-entity query'
  }
];

// Test spell correction
describe('Spell Correction Tests', () => {
  test('should correct common brand misspellings', () => {
    expect(correctSpelling('aple')).toBe('apple');
    expect(correctSpelling('samsang')).toBe('samsung');
    expect(correctSpelling('naik')).toBe('nike');
    expect(correctSpelling('addidas')).toBe('adidas');
  });

  test('should correct product name misspellings', () => {
    expect(correctSpelling('iphone')).toBe('iphone');
    expect(correctSpelling('i phone')).toBe('iphone');
    expect(correctSpelling('earbuds')).toBe('earbuds');
    expect(correctSpelling('ear buds')).toBe('earbuds');
  });

  test('should handle mixed corrections', () => {
    expect(correctSpelling('aple i phone')).toBe('apple iphone');
    expect(correctSpelling('samsang ear buds')).toBe('samsung earbuds');
  });
});

// Test phonetic matching
describe('Phonetic Matching Tests', () => {
  test('should match similar sounding words', () => {
    expect(soundsLike('apple', 'aple')).toBe(true);
    expect(soundsLike('samsung', 'samsang')).toBe(true);
    expect(soundsLike('nike', 'naik')).toBe(true);
  });

  test('should not match different sounding words', () => {
    expect(soundsLike('apple', 'samsung')).toBe(false);
    expect(soundsLike('nike', 'adidas')).toBe(false);
  });
});

// Test similarity calculation
describe('Similarity Calculation Tests', () => {
  test('should calculate high similarity for close matches', () => {
    expect(calculateSimilarity('apple', 'aple')).toBeGreaterThan(0.8);
    expect(calculateSimilarity('samsung', 'samsang')).toBeGreaterThan(0.8);
    expect(calculateSimilarity('iphone', 'i phone')).toBeGreaterThan(0.7);
  });

  test('should calculate low similarity for different words', () => {
    expect(calculateSimilarity('apple', 'samsung')).toBeLessThan(0.3);
    expect(calculateSimilarity('nike', 'beauty')).toBeLessThan(0.3);
  });
});

// Test NLP service
describe('NLP Service Tests', () => {
  testCases.forEach((testCase, index) => {
    test(`Test case ${index + 1}: ${testCase.description}`, () => {
      const parsedQuery = nlpService.parseQuery(testCase.query);
      
      // Check intent detection
      expect(parsedQuery.intent).toBe('search');
      
      // Check brand extraction
      if (testCase.expectedBrand) {
        expect(parsedQuery.entities.brand?.toLowerCase()).toBe(testCase.expectedBrand.toLowerCase());
      }
      
      // Check category extraction
      if (testCase.expectedCategory) {
        expect(parsedQuery.entities.category).toBe(testCase.expectedCategory);
      }
      
      // Check product extraction
      if (testCase.expectedProduct) {
        expect(parsedQuery.entities.product?.toLowerCase()).toContain(testCase.expectedProduct.toLowerCase());
      }
      
      // Check price range extraction
      if (testCase.expectedPriceRange) {
        if (testCase.expectedPriceRange.max) {
          expect(parsedQuery.entities.priceRange?.max).toBe(testCase.expectedPriceRange.max);
        }
        if (testCase.expectedPriceRange.min) {
          expect(parsedQuery.entities.priceRange?.min).toBe(testCase.expectedPriceRange.min);
        }
      }
      
      // Check confidence score
      expect(parsedQuery.confidence).toBeGreaterThan(0.3);
    });
  });
});

// Test fuzzy search engine
describe('Fuzzy Search Engine Tests', () => {
  const fuzzySearch = new FuzzySearchEngine({
    threshold: 0.2,
    keys: ['name', 'brand', 'description', 'tags'],
    shouldSort: true,
  });

  test('should find exact matches', () => {
    const results = fuzzySearch.search('iPhone 14 Pro Max', testProducts);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.name).toBe('Apple iPhone 14 Pro Max');
    expect(results[0].score).toBeGreaterThan(0.8);
  });

  test('should find partial matches', () => {
    const results = fuzzySearch.search('iPhone', testProducts);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.brand).toBe('Apple');
  });

  test('should find brand matches', () => {
    const results = fuzzySearch.search('Samsung', testProducts);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.brand).toBe('Samsung');
  });

  test('should handle misspellings', () => {
    const results = fuzzySearch.search('Samsang', testProducts);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.brand).toBe('Samsung');
  });

  test('should find category matches', () => {
    const results = fuzzySearch.search('beauty', testProducts);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.category).toBe('beauty');
  });

  test('should sort results by relevance', () => {
    const results = fuzzySearch.search('phone', testProducts);
    expect(results.length).toBeGreaterThan(1);
    // First result should have higher score than second
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });
});

// Integration test
describe('Voice Search Integration Tests', () => {
  test('should handle complete voice search workflow', () => {
    const query = 'find samsung earbuds under 15000';
    
    // Step 1: Parse query with NLP
    const parsedQuery = nlpService.parseQuery(query);
    expect(parsedQuery.intent).toBe('search');
    expect(parsedQuery.entities.brand?.toLowerCase()).toBe('samsung');
    expect(parsedQuery.entities.product?.toLowerCase()).toContain('earbuds');
    expect(parsedQuery.entities.priceRange?.max).toBe(15000);
    
    // Step 2: Apply spell correction
    const correctedQuery = correctSpelling(query);
    expect(correctedQuery).toContain('samsung');
    expect(correctedQuery).toContain('earbuds');
    
    // Step 3: Fuzzy search
    const fuzzySearch = new FuzzySearchEngine({
      threshold: 0.2,
      keys: ['name', 'brand', 'description', 'tags'],
    });
    
    const results = fuzzySearch.search(correctedQuery, testProducts);
    expect(results.length).toBeGreaterThan(0);
    
    // Step 4: Filter by price
    const filteredResults = results.filter(result => 
      result.item.basePrice <= (parsedQuery.entities.priceRange?.max || Infinity)
    );
    expect(filteredResults.length).toBeGreaterThan(0);
    expect(filteredResults[0].item.brand).toBe('Samsung');
  });
});

export { testCases, testProducts };
