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
    price: /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
    priceRange: /(?:under|below|less than)\s*\$?(\d+)|(?:between)\s*\$?(\d+)\s*(?:and|to)\s*\$?(\d+)|(?:above|over|more than)\s*\$?(\d+)/gi,
    size: /size\s*(\d+(?:\.\d)?)|(\d+(?:\.\d)?)\s*(?:size|sz)/gi,
    color: /\b(black|white|red|blue|green|yellow|orange|purple|pink|brown|gray|grey|silver|gold|navy|maroon|teal|cyan|magenta|lime|olive|aqua|fuchsia)\b/gi,
    brand: /\b(nike|adidas|jordan|puma|reebok|new balance|converse|vans|under armour|asics|skechers|fila|champion|timberland|dr martens|clarks|ugg|crocs|birkenstock|allbirds|on running|hoka|brooks|saucony|mizuno|diadora|kappa|umbro|lotto|joma|hummel|kelme|munich|lonsdale|everlast|venum|tapout|affliction|bad boy|hayabusa|century|title|ringside|twins special|fairtex|top king|raja|windy|yokkao|boon|thaismai|muay thai|boxing|mma|ufc|bellator|one championship|pride|strikeforce|wec|invicta|cage warriors|bamma|titan fc|legacy fc|resurrection fighting alliance|king of the cage|pancrase|deep|rizin|road fc|ace|shooto|vale tudo|ifc|wfc|tfc|cfc|efc|kfc|pfc|afc|ofc|sfc|rfc|mfc|lfc|gfc|hfc|jfc|qfc|ufc|vfc|wfc|xfc|yfc|zfc)\b/gi,
    category: /\b(sneakers?|shoes?|boots?|sandals?|slippers?|heels?|flats?|loafers?|oxfords?|dress shoes?|running shoes?|basketball shoes?|tennis shoes?|golf shoes?|hiking boots?|work boots?|rain boots?|snow boots?|ankle boots?|knee boots?|thigh boots?|over the knee boots?|combat boots?|chelsea boots?|chukka boots?|desert boots?|wellington boots?|cowboy boots?|motorcycle boots?|steel toe boots?|safety boots?|tactical boots?|military boots?|police boots?|firefighter boots?|emt boots?|paramedic boots?|nurse shoes?|chef shoes?|restaurant shoes?|kitchen shoes?|slip resistant shoes?|non slip shoes?|oil resistant shoes?|chemical resistant shoes?|electrical hazard shoes?|composite toe shoes?|metatarsal shoes?|puncture resistant shoes?|waterproof shoes?|insulated shoes?|breathable shoes?|lightweight shoes?|heavy duty shoes?|durable shoes?|comfortable shoes?|supportive shoes?|cushioned shoes?|arch support shoes?|orthopedic shoes?|diabetic shoes?|wide shoes?|narrow shoes?|extra wide shoes?|extra narrow shoes?|big shoes?|small shoes?|large shoes?|tiny shoes?|huge shoes?|giant shoes?|mini shoes?|micro shoes?|nano shoes?|pico shoes?|femto shoes?|atto shoes?|zepto shoes?|yocto shoes?)\b/gi,
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
   * Parse natural language query into structured data
   */
  public parseQuery(query: string, previousQuery?: string): ParsedQuery {
    const normalizedQuery = query.toLowerCase().trim();
    
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
      originalQuery: query,
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
      'sneakers': 'sneakers',
      'shoes': 'sneakers',
      'boots': 'sneakers',
      'sandals': 'sneakers',
      'concert tickets': 'concert-tickets',
      'tickets': 'concert-tickets',
      'sports tickets': 'sports-tickets',
      'game tickets': 'sports-tickets',
    };

    const normalized = category.toLowerCase();
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
