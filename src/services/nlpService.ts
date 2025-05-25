/**
 * Natural Language Processing Service for Voice Search
 * Handles intent recognition, entity extraction, and query parsing
 */

export interface ParsedQuery {
  intent: 'search' | 'compare' | 'navigate' | 'purchase' | 'filter' | 'help' | 'unknown';
  entities: {
    product?: string;
    brand?: string;
    category?: string;
    priceRange?: { min?: number; max?: number };
    size?: string;
    color?: string;
    condition?: string;
    location?: string;
    features?: string[];
  };
  filters: {
    sortBy?: 'price' | 'rating' | 'delivery' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    maxPrice?: number;
    minPrice?: number;
    fastShipping?: boolean;
    freeReturns?: boolean;
  };
  context: {
    isFollowUp: boolean;
    previousQuery?: string;
    conversationTurn: number;
  };
  confidence: number;
  originalQuery: string;
}

export interface ConversationContext {
  history: Array<{
    query: string;
    response: string;
    timestamp: number;
    intent: string;
  }>;
  userPreferences: {
    preferredBrands: string[];
    priceRange: { min: number; max: number };
    categories: string[];
    shippingPreference: 'fast' | 'cheap' | 'standard';
  };
  currentSession: {
    searchTopic?: string;
    lastProducts?: string[];
    activeFilters: Record<string, any>;
  };
}

class NLPService {
  private intentPatterns: Record<string, RegExp[]> = {
    search: [
      /find|search|look for|show me|get me|i want|i need/i,
      /where can i (find|get|buy)/i,
      /do you have/i,
    ],
    compare: [
      /compare|versus|vs|difference between|which is better/i,
      /what's the difference/i,
      /pros and cons/i,
    ],
    navigate: [
      /go to|navigate to|show|take me to|open/i,
      /back|previous|next|home/i,
    ],
    purchase: [
      /buy|purchase|order|add to cart|checkout/i,
      /i'll take|i want to buy/i,
    ],
    filter: [
      /filter|sort|arrange|organize/i,
      /under \$|below|less than|cheaper than/i,
      /above|more than|over|expensive/i,
    ],
    help: [
      /help|how do|what can|explain|guide/i,
      /i don't understand|confused/i,
    ],
  };

  private entityPatterns = {
    // Enhanced price patterns for Indian currency (₹, Rs., rupees)
    price: /(?:₹|rs\.?|rupees?)\s*(\d+(?:,\d{2,3})*(?:\.\d{2})?)|(\d+(?:,\d{2,3})*(?:\.\d{2})?)\s*(?:₹|rs\.?|rupees?)|(?:\$|usd)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)|(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\$|usd)/gi,
    priceRange: /(?:under|below|less than|cheaper than)\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:,\d{2,3})*)|(?:between)\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:,\d{2,3})*)\s*(?:and|to)\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:,\d{2,3})*)|(?:above|over|more than|expensive than)\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:,\d{2,3})*)/gi,
    size: /size\s*(\d+(?:\.\d)?)|(\d+(?:\.\d)?)\s*(?:size|sz)|(?:small|medium|large|xl|xxl|s|m|l)\b/gi,
    color: /\b(black|white|red|blue|green|yellow|orange|purple|pink|brown|gray|grey|silver|gold|navy|maroon|teal|cyan|magenta|lime|olive|aqua|fuchsia|rose|cream|beige|tan|khaki|burgundy|violet|indigo|turquoise|coral|salmon|peach|mint|lavender)\b/gi,
    // Enhanced brand patterns including Indian and international brands
    brand: /\b(apple|samsung|oneplus|xiaomi|realme|oppo|vivo|huawei|honor|motorola|nokia|sony|lg|htc|google|pixel|iphone|galaxy|redmi|poco|mi|iqoo|nothing|fairphone|asus|lenovo|acer|hp|dell|microsoft|surface|macbook|ipad|airpods|beats|bose|jbl|harman kardon|marshall|skullcandy|sennheiser|audio technica|sony|philips|panasonic|lg|tcl|hisense|mi tv|oneplus tv|realme tv|nike|adidas|puma|reebok|new balance|converse|vans|under armour|asics|skechers|fila|champion|timberland|dr martens|clarks|ugg|crocs|birkenstock|woodland|bata|liberty|red chief|hush puppies|lee cooper|red tape|provogue|arrow|van heusen|peter england|allen solly|louis philippe|park avenue|blackberrys|raymond|zodiac|colorplus|john players|wrangler|levis|lee|pepe jeans|flying machine|spykar|killer|being human|roadster|hrx|puma|adidas|nike|reebok|fila|skechers|woodland|bata|liberty|red chief|hush puppies|lee cooper|red tape|loreal|olay|nivea|ponds|lakme|maybelline|revlon|mac|nykaa|sugar|colorbar|faces|lotus|himalaya|patanjali|dabur|bajaj|emami|mamaearth|wow|plum|the ordinary|cerave|neutrogena|garnier|head shoulders|pantene|tresemme|matrix|schwarzkopf|wella|streax|godrej|parachute|coconut oil|almond oil|argan oil|jojoba oil|tea tree oil)\b/gi,
    // Enhanced category patterns for Indian marketplace
    category: /\b(electronics?|mobile?|phone?|smartphone?|tablet?|laptop?|computer?|tv|television|headphone?|earphone?|speaker?|camera?|watch|smartwatch|fitness tracker|gaming|console|accessories?|fashion|clothing|clothes|shirt?|t-?shirt?|pant?|trouser?|jean?|dress|skirt|top|blouse|jacket|coat|sweater|hoodie|kurta|saree|lehenga|salwar|kameez|ethnic wear|western wear|footwear|shoe?|sneaker?|boot?|sandal?|slipper?|heel?|flat?|loafer?|oxford?|running shoe?|sports shoe?|casual shoe?|formal shoe?|beauty|cosmetic?|makeup|skincare|haircare|fragrance|perfume|deodorant|shampoo|conditioner|face wash|moisturizer|sunscreen|serum|foundation|lipstick|mascara|eyeliner|nail polish|home|kitchen|appliance?|furniture|decor|bedding|bath|towel|curtain|carpet|rug|lighting|fan|ac|air conditioner|refrigerator|washing machine|microwave|oven|mixer|grinder|pressure cooker|induction|gas stove|water purifier|books?|novel?|textbook?|magazine?|stationery|pen|pencil|notebook|diary|bag|backpack|handbag|wallet|luggage|suitcase|travel|sports|fitness|gym|yoga|cricket|football|badminton|tennis|basketball|swimming|cycling|running|toys?|games?|kids|baby|infant|toddler|children|grocery|food|snack?|beverage?|drink?|tea|coffee|juice|water|oil|spice?|rice|wheat|dal|pulse?|vegetable?|fruit?|meat|fish|chicken|mutton|egg|milk|cheese|butter|ghee|sugar|salt|medicine?|health|vitamin?|supplement?|protein|pharmacy|medical|first aid|thermometer|bp monitor|glucometer|inhaler|mask|sanitizer|soap|detergent|cleaning|household|personal care|oral care|toothbrush|toothpaste|mouthwash|razor|shaving|cream|lotion|oil|powder|diaper|sanitary pad|condom|pregnancy test|contraceptive)\b/gi,
  };

  private conversationContext: ConversationContext = {
    history: [],
    userPreferences: {
      preferredBrands: [],
      priceRange: { min: 0, max: 1000 },
      categories: [],
      shippingPreference: 'standard',
    },
    currentSession: {
      activeFilters: {},
    },
  };

  /**
   * Clean query by removing unwanted punctuation and characters
   */
  private cleanQuery(query: string): string {
    if (!query) return '';

    return query
      // Remove trailing periods, commas, and other punctuation
      .replace(/[.,!?;:]+$/g, '')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Keep the original case for proper noun recognition
      // Remove any unwanted characters but keep essential ones
      .replace(/[^\w\s\-']/g, '')
      // Clean up any double spaces that might have been created
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parse natural language query into structured data
   */
  public parseQuery(query: string, previousQuery?: string): ParsedQuery {
    // Clean the query first - remove any unwanted punctuation or characters
    const cleanedQuery = this.cleanQuery(query);
    const normalizedQuery = cleanedQuery.toLowerCase().trim();

    // Detect intent
    const intent = this.detectIntent(normalizedQuery);

    // Extract entities
    const entities = this.extractEntities(normalizedQuery);

    // Extract filters
    const filters = this.extractFilters(normalizedQuery);

    // Determine if this is a follow-up query
    const isFollowUp = this.isFollowUpQuery(normalizedQuery, previousQuery);

    // Calculate confidence score
    const confidence = this.calculateConfidence(intent, entities, normalizedQuery);

    return {
      intent,
      entities,
      filters,
      context: {
        isFollowUp,
        previousQuery,
        conversationTurn: this.conversationContext.history.length + 1,
      },
      confidence,
      originalQuery: cleanedQuery, // Use cleaned query instead of raw input
    };
  }

  /**
   * Detect user intent from query
   */
  private detectIntent(query: string): ParsedQuery['intent'] {
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(pattern => pattern.test(query))) {
        return intent as ParsedQuery['intent'];
      }
    }
    return 'unknown';
  }

  /**
   * Extract entities from query
   */
  private extractEntities(query: string): ParsedQuery['entities'] {
    const entities: ParsedQuery['entities'] = {};

    // Extract price information
    const priceRangeMatch = query.match(this.entityPatterns.priceRange);
    if (priceRangeMatch) {
      const match = priceRangeMatch[0];
      if (match.includes('under') || match.includes('below') || match.includes('less than')) {
        const price = parseInt(match.match(/\d+/)?.[0] || '0');
        entities.priceRange = { max: price };
      } else if (match.includes('above') || match.includes('over') || match.includes('more than')) {
        const price = parseInt(match.match(/\d+/)?.[0] || '0');
        entities.priceRange = { min: price };
      } else if (match.includes('between')) {
        const prices = match.match(/\d+/g);
        if (prices && prices.length >= 2) {
          entities.priceRange = { min: parseInt(prices[0]), max: parseInt(prices[1]) };
        }
      }
    }

    // Extract size
    const sizeMatch = query.match(this.entityPatterns.size);
    if (sizeMatch) {
      entities.size = sizeMatch[0].match(/\d+(?:\.\d)?/)?.[0];
    }

    // Extract color
    const colorMatch = query.match(this.entityPatterns.color);
    if (colorMatch) {
      entities.color = colorMatch[0];
    }

    // Extract brand
    const brandMatch = query.match(this.entityPatterns.brand);
    if (brandMatch) {
      entities.brand = brandMatch[0];
    }

    // Extract category
    const categoryMatch = query.match(this.entityPatterns.category);
    if (categoryMatch) {
      entities.category = this.normalizeCategoryName(categoryMatch[0]);
    }

    // Extract product name (everything that's not a recognized entity)
    entities.product = this.extractProductName(query, entities);

    return entities;
  }

  /**
   * Extract filters from query
   */
  private extractFilters(query: string): ParsedQuery['filters'] {
    const filters: ParsedQuery['filters'] = {};

    // Sort preferences
    if (/cheapest|lowest price|best price/i.test(query)) {
      filters.sortBy = 'price';
      filters.sortOrder = 'asc';
    } else if (/most expensive|highest price/i.test(query)) {
      filters.sortBy = 'price';
      filters.sortOrder = 'desc';
    } else if (/best rated|highest rated|top rated/i.test(query)) {
      filters.sortBy = 'rating';
      filters.sortOrder = 'desc';
    } else if (/fastest delivery|quick shipping|fast shipping/i.test(query)) {
      filters.sortBy = 'delivery';
      filters.sortOrder = 'asc';
    }

    // Shipping preferences
    if (/fast shipping|quick delivery|express/i.test(query)) {
      filters.fastShipping = true;
    }

    // Return policy
    if (/free returns|easy returns/i.test(query)) {
      filters.freeReturns = true;
    }

    return filters;
  }

  /**
   * Check if query is a follow-up to previous query
   */
  private isFollowUpQuery(query: string, previousQuery?: string): boolean {
    if (!previousQuery) return false;

    const followUpIndicators = [
      /also|too|as well/i,
      /what about|how about/i,
      /similar|like that|like those/i,
      /cheaper|more expensive|better/i,
      /different color|other colors/i,
      /larger|smaller|bigger/i,
    ];

    return followUpIndicators.some(pattern => pattern.test(query));
  }

  /**
   * Calculate confidence score for parsed query
   */
  private calculateConfidence(intent: string, entities: ParsedQuery['entities'], query: string): number {
    let confidence = 0.5; // Base confidence

    // Intent recognition confidence
    if (intent !== 'unknown') confidence += 0.2;

    // Entity extraction confidence
    const entityCount = Object.keys(entities).filter(key => entities[key as keyof typeof entities]).length;
    confidence += Math.min(entityCount * 0.1, 0.3);

    // Query length and complexity
    const wordCount = query.split(' ').length;
    if (wordCount >= 3 && wordCount <= 10) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Normalize category names to match product categories
   */
  private normalizeCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      // Electronics
      'electronics': 'electronics',
      'electronic': 'electronics',
      'mobile': 'electronics',
      'phone': 'electronics',
      'smartphone': 'electronics',
      'tablet': 'electronics',
      'laptop': 'electronics',
      'computer': 'electronics',
      'tv': 'electronics',
      'television': 'electronics',
      'headphone': 'electronics',
      'earphone': 'electronics',
      'speaker': 'electronics',
      'camera': 'electronics',
      'watch': 'electronics',
      'smartwatch': 'electronics',
      'fitness tracker': 'electronics',
      'gaming': 'electronics',
      'console': 'electronics',
      'accessories': 'electronics',

      // Fashion
      'fashion': 'fashion',
      'clothing': 'fashion',
      'clothes': 'fashion',
      'shirt': 'fashion',
      'tshirt': 'fashion',
      't-shirt': 'fashion',
      'pant': 'fashion',
      'trouser': 'fashion',
      'jean': 'fashion',
      'dress': 'fashion',
      'skirt': 'fashion',
      'top': 'fashion',
      'blouse': 'fashion',
      'jacket': 'fashion',
      'coat': 'fashion',
      'sweater': 'fashion',
      'hoodie': 'fashion',
      'kurta': 'fashion',
      'saree': 'fashion',
      'lehenga': 'fashion',
      'salwar': 'fashion',
      'kameez': 'fashion',
      'ethnic wear': 'fashion',
      'western wear': 'fashion',
      'footwear': 'fashion',
      'shoe': 'fashion',
      'shoes': 'fashion',
      'sneaker': 'fashion',
      'sneakers': 'fashion',
      'boot': 'fashion',
      'boots': 'fashion',
      'sandal': 'fashion',
      'sandals': 'fashion',
      'slipper': 'fashion',
      'heel': 'fashion',
      'flat': 'fashion',
      'loafer': 'fashion',
      'oxford': 'fashion',

      // Beauty
      'beauty': 'beauty',
      'cosmetic': 'beauty',
      'cosmetics': 'beauty',
      'makeup': 'beauty',
      'skincare': 'beauty',
      'haircare': 'beauty',
      'fragrance': 'beauty',
      'perfume': 'beauty',
      'deodorant': 'beauty',
      'shampoo': 'beauty',
      'conditioner': 'beauty',
      'face wash': 'beauty',
      'moisturizer': 'beauty',
      'sunscreen': 'beauty',
      'serum': 'beauty',
      'foundation': 'beauty',
      'lipstick': 'beauty',
      'mascara': 'beauty',
      'eyeliner': 'beauty',
      'nail polish': 'beauty',

      // Legacy mappings for backward compatibility
      'concert tickets': 'concert-tickets',
      'tickets': 'concert-tickets',
      'sports tickets': 'sports-tickets',
      'game tickets': 'sports-tickets',
    };

    const normalized = category.toLowerCase().trim();
    return categoryMap[normalized] || normalized;
  }

  /**
   * Extract product name from query, excluding recognized entities
   */
  private extractProductName(query: string, entities: ParsedQuery['entities']): string {
    let productName = query;

    // Remove recognized entities from product name
    if (entities.brand) {
      productName = productName.replace(new RegExp(entities.brand, 'gi'), '');
    }
    if (entities.color) {
      productName = productName.replace(new RegExp(entities.color, 'gi'), '');
    }
    if (entities.size) {
      productName = productName.replace(new RegExp(`size\\s*${entities.size}|${entities.size}\\s*size`, 'gi'), '');
    }

    // Remove common search terms
    productName = productName.replace(/\b(find|search|look for|show me|get me|i want|i need|under|over|below|above|less than|more than)\b/gi, '');

    // Remove price mentions
    productName = productName.replace(/\$?\d+(?:,\d{3})*(?:\.\d{2})?/g, '');

    return productName.trim().replace(/\s+/g, ' ');
  }

  /**
   * Update conversation context
   */
  public updateContext(query: string, response: string, intent: string): void {
    this.conversationContext.history.push({
      query,
      response,
      timestamp: Date.now(),
      intent,
    });

    // Keep only last 10 interactions
    if (this.conversationContext.history.length > 10) {
      this.conversationContext.history = this.conversationContext.history.slice(-10);
    }
  }

  /**
   * Get conversation context
   */
  public getContext(): ConversationContext {
    return this.conversationContext;
  }

  /**
   * Reset conversation context
   */
  public resetContext(): void {
    this.conversationContext = {
      history: [],
      userPreferences: {
        preferredBrands: [],
        priceRange: { min: 0, max: 1000 },
        categories: [],
        shippingPreference: 'standard',
      },
      currentSession: {
        activeFilters: {},
      },
    };
  }
}

export const nlpService = new NLPService();
