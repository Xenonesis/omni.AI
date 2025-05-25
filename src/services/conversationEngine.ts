/**
 * AI Conversation Engine for Voice Shopping Assistant
 * Handles conversational responses, context management, and voice guidance
 */

import { ParsedQuery, nlpService } from './nlpService';
import { Product, ProductRecommendation } from '../types/marketplace';

export interface AIResponse {
  text: string;
  action?: 'search' | 'navigate' | 'filter' | 'compare' | 'help' | 'clarify';
  suggestions?: string[];
  followUpQuestions?: string[];
  searchParams?: any;
  navigationTarget?: string;
  confidence: number;
  shouldSpeak: boolean;
}

export interface ConversationState {
  isActive: boolean;
  currentTopic?: string;
  awaitingResponse: boolean;
  lastInteraction: number;
  sessionId: string;
}

class ConversationEngine {
  private state: ConversationState = {
    isActive: false,
    awaitingResponse: false,
    lastInteraction: 0,
    sessionId: '',
  };

  private responseTemplates = {
    greeting: [
      "Hi! I'm your AI shopping assistant. What can I help you find today?",
      "Hello! I'm here to help you find the best deals. What are you looking for?",
      "Welcome! Tell me what you'd like to shop for and I'll find the best options.",
    ],
    search: {
      found: [
        "Great! I found {count} options for {query}. Here are the best deals:",
        "Perfect! I discovered {count} products matching '{query}'. Let me show you the top recommendations:",
        "Excellent! I found {count} results for {query}. Here are my top picks:",
      ],
      notFound: [
        "I couldn't find any products matching '{query}'. Would you like to try a different search?",
        "No results found for '{query}'. Let me suggest some alternatives:",
        "I didn't find anything for '{query}'. Could you be more specific or try different keywords?",
      ],
      clarification: [
        "I want to make sure I find exactly what you're looking for. Could you tell me more about {entity}?",
        "To give you the best results, could you specify {entity}?",
        "I need a bit more information about {entity} to find the perfect match.",
      ],
    },
    compare: [
      "Let me compare these options for you. Here's what I found:",
      "I'll analyze the differences between these products:",
      "Here's a detailed comparison to help you decide:",
    ],
    price: {
      budget: [
        "I understand you're looking for something under ${price}. Here are the best options in your budget:",
        "Great! I found several excellent choices under ${price}:",
        "Perfect! Here are the top-rated products within your ${price} budget:",
      ],
      expensive: [
        "I found some premium options above ${price}. Here are the best high-end choices:",
        "For products over ${price}, here are the top luxury options:",
        "These premium products above ${price} offer exceptional quality:",
      ],
    },
    navigation: [
      "I'll take you to {destination}. Is there anything specific you'd like to see there?",
      "Navigating to {destination}. What would you like to do next?",
      "Here's {destination}. How can I help you explore this section?",
    ],
    help: [
      "I can help you search for products, compare prices, find deals, and navigate the marketplace. What would you like to do?",
      "Here's what I can do: search for products, compare options, filter by price or features, and guide you through purchases. How can I assist?",
      "I'm here to make shopping easier! I can find products, compare deals, answer questions, and help you navigate. What do you need?",
    ],
    error: [
      "I'm sorry, I didn't quite understand that. Could you rephrase your request?",
      "I'm having trouble understanding. Could you try asking in a different way?",
      "Let me help you better. Could you be more specific about what you're looking for?",
    ],
    followUp: [
      "Would you like to see more options?",
      "Is there anything else I can help you find?",
      "What else would you like to explore?",
      "Any other questions about these products?",
    ],
  };

  /**
   * Generate AI response based on parsed query and context
   */
  public generateResponse(parsedQuery: ParsedQuery, searchResults?: any): AIResponse {
    const { intent, entities, confidence, originalQuery } = parsedQuery;
    
    let response: AIResponse = {
      text: '',
      confidence: confidence,
      shouldSpeak: true,
    };

    switch (intent) {
      case 'search':
        response = this.handleSearchIntent(parsedQuery, searchResults);
        break;
      case 'compare':
        response = this.handleCompareIntent(parsedQuery, searchResults);
        break;
      case 'navigate':
        response = this.handleNavigateIntent(parsedQuery);
        break;
      case 'filter':
        response = this.handleFilterIntent(parsedQuery);
        break;
      case 'help':
        response = this.handleHelpIntent(parsedQuery);
        break;
      case 'purchase':
        response = this.handlePurchaseIntent(parsedQuery);
        break;
      default:
        response = this.handleUnknownIntent(parsedQuery);
    }

    // Update conversation context
    nlpService.updateContext(originalQuery, response.text, intent);
    this.updateState(intent);

    return response;
  }

  /**
   * Handle search intent
   */
  private handleSearchIntent(parsedQuery: ParsedQuery, searchResults?: any): AIResponse {
    const { entities, originalQuery } = parsedQuery;
    const hasResults = searchResults && searchResults.products && searchResults.products.length > 0;

    if (hasResults) {
      const count = searchResults.products.length;
      const template = this.getRandomTemplate(this.responseTemplates.search.found);
      const text = template
        .replace('{count}', count.toString())
        .replace('{query}', originalQuery);

      return {
        text,
        action: 'search',
        suggestions: this.generateSearchSuggestions(entities),
        followUpQuestions: [
          "Would you like to filter by price range?",
          "Should I show you similar products?",
          "Would you like to compare the top options?",
        ],
        searchParams: this.buildSearchParams(parsedQuery),
        confidence: parsedQuery.confidence,
        shouldSpeak: true,
      };
    } else {
      const template = this.getRandomTemplate(this.responseTemplates.search.notFound);
      const text = template.replace('{query}', originalQuery);

      return {
        text,
        action: 'clarify',
        suggestions: this.generateAlternativeSuggestions(entities),
        followUpQuestions: [
          "Would you like to try a different brand?",
          "Should I search in a different category?",
          "Would you like to adjust your price range?",
        ],
        confidence: parsedQuery.confidence,
        shouldSpeak: true,
      };
    }
  }

  /**
   * Handle compare intent
   */
  private handleCompareIntent(parsedQuery: ParsedQuery, searchResults?: any): AIResponse {
    const template = this.getRandomTemplate(this.responseTemplates.compare);
    
    return {
      text: template,
      action: 'compare',
      suggestions: [
        "Compare by price",
        "Compare by features",
        "Compare by seller rating",
        "Compare shipping options",
      ],
      followUpQuestions: [
        "Which aspect is most important to you?",
        "Would you like detailed specifications?",
        "Should I highlight the key differences?",
      ],
      confidence: parsedQuery.confidence,
      shouldSpeak: true,
    };
  }

  /**
   * Handle navigation intent
   */
  private handleNavigateIntent(parsedQuery: ParsedQuery): AIResponse {
    const destination = this.extractNavigationDestination(parsedQuery.originalQuery);
    const template = this.getRandomTemplate(this.responseTemplates.navigation);
    const text = template.replace('{destination}', destination);

    return {
      text,
      action: 'navigate',
      navigationTarget: destination,
      suggestions: this.getNavigationSuggestions(destination),
      confidence: parsedQuery.confidence,
      shouldSpeak: true,
    };
  }

  /**
   * Handle filter intent
   */
  private handleFilterIntent(parsedQuery: ParsedQuery): AIResponse {
    const { filters, entities } = parsedQuery;
    let text = "I'll apply those filters for you. ";

    if (filters.sortBy) {
      text += `Sorting by ${filters.sortBy} in ${filters.sortOrder === 'asc' ? 'ascending' : 'descending'} order. `;
    }

    if (entities.priceRange) {
      if (entities.priceRange.max) {
        const template = this.getRandomTemplate(this.responseTemplates.price.budget);
        text = template.replace('${price}', entities.priceRange.max.toString());
      } else if (entities.priceRange.min) {
        const template = this.getRandomTemplate(this.responseTemplates.price.expensive);
        text = template.replace('${price}', entities.priceRange.min.toString());
      }
    }

    return {
      text,
      action: 'filter',
      searchParams: this.buildSearchParams(parsedQuery),
      suggestions: [
        "Sort by price",
        "Filter by brand",
        "Filter by rating",
        "Filter by shipping speed",
      ],
      confidence: parsedQuery.confidence,
      shouldSpeak: true,
    };
  }

  /**
   * Handle help intent
   */
  private handleHelpIntent(parsedQuery: ParsedQuery): AIResponse {
    const template = this.getRandomTemplate(this.responseTemplates.help);

    return {
      text: template,
      action: 'help',
      suggestions: [
        "Search for products",
        "Compare prices",
        "Find deals",
        "Navigate marketplace",
      ],
      followUpQuestions: [
        "What would you like to search for?",
        "Do you need help with a specific product?",
        "Would you like a tour of the features?",
      ],
      confidence: parsedQuery.confidence,
      shouldSpeak: true,
    };
  }

  /**
   * Handle purchase intent
   */
  private handlePurchaseIntent(parsedQuery: ParsedQuery): AIResponse {
    return {
      text: "I'll help you with that purchase. Let me guide you through the checkout process.",
      action: 'navigate',
      navigationTarget: 'checkout',
      suggestions: [
        "Add to cart",
        "View cart",
        "Proceed to checkout",
        "Save for later",
      ],
      followUpQuestions: [
        "Would you like to review your cart first?",
        "Do you need help with shipping options?",
        "Would you like to apply any discount codes?",
      ],
      confidence: parsedQuery.confidence,
      shouldSpeak: true,
    };
  }

  /**
   * Handle unknown intent
   */
  private handleUnknownIntent(parsedQuery: ParsedQuery): AIResponse {
    const template = this.getRandomTemplate(this.responseTemplates.error);

    return {
      text: template,
      action: 'clarify',
      suggestions: [
        "Search for products",
        "Browse categories",
        "Get help",
        "View deals",
      ],
      followUpQuestions: [
        "Are you looking for a specific product?",
        "Would you like to browse by category?",
        "Do you need help getting started?",
      ],
      confidence: 0.3,
      shouldSpeak: true,
    };
  }

  /**
   * Build search parameters from parsed query
   */
  private buildSearchParams(parsedQuery: ParsedQuery): any {
    const { entities, filters } = parsedQuery;
    
    return {
      query: entities.product || '',
      category: entities.category,
      brand: entities.brand,
      priceRange: entities.priceRange,
      size: entities.size,
      color: entities.color,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      fastShipping: filters.fastShipping,
      freeReturns: filters.freeReturns,
    };
  }

  /**
   * Generate search suggestions based on entities
   */
  private generateSearchSuggestions(entities: any): string[] {
    const suggestions = [];
    
    if (entities.brand) {
      suggestions.push(`More ${entities.brand} products`);
    }
    if (entities.category) {
      suggestions.push(`Other ${entities.category}`);
    }
    if (entities.priceRange) {
      suggestions.push("Similar price range");
    }
    
    suggestions.push("Best deals", "Top rated", "Fast shipping");
    
    return suggestions.slice(0, 4);
  }

  /**
   * Generate alternative suggestions when no results found
   */
  private generateAlternativeSuggestions(entities: any): string[] {
    const suggestions = [];
    
    if (entities.brand) {
      suggestions.push("Try different brand");
    }
    if (entities.category) {
      suggestions.push("Browse all categories");
    }
    
    suggestions.push("Expand price range", "Popular products", "Today's deals");
    
    return suggestions.slice(0, 4);
  }

  /**
   * Extract navigation destination from query
   */
  private extractNavigationDestination(query: string): string {
    const destinations = {
      'home': /home|main|start/i,
      'cart': /cart|basket|bag/i,
      'orders': /orders|purchases|history/i,
      'deals': /deals|offers|discounts/i,
      'categories': /categories|browse/i,
      'settings': /settings|preferences|account/i,
    };

    for (const [dest, pattern] of Object.entries(destinations)) {
      if (pattern.test(query)) {
        return dest;
      }
    }

    return 'marketplace';
  }

  /**
   * Get navigation suggestions based on destination
   */
  private getNavigationSuggestions(destination: string): string[] {
    const suggestions: Record<string, string[]> = {
      home: ["Browse categories", "View deals", "Search products", "My account"],
      cart: ["Checkout", "Save for later", "Continue shopping", "Remove items"],
      orders: ["Track order", "Reorder", "Return item", "Leave review"],
      deals: ["Today's deals", "Flash sales", "Clearance", "Coupons"],
      categories: ["Sneakers", "Electronics", "Clothing", "Home"],
      settings: ["Preferences", "Payment methods", "Addresses", "Notifications"],
    };

    return suggestions[destination] || ["Browse products", "Search", "View deals", "Help"];
  }

  /**
   * Get random template from array
   */
  private getRandomTemplate(templates: string[]): string {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Update conversation state
   */
  private updateState(intent: string): void {
    this.state.lastInteraction = Date.now();
    this.state.currentTopic = intent;
    this.state.isActive = true;
  }

  /**
   * Get conversation state
   */
  public getState(): ConversationState {
    return this.state;
  }

  /**
   * Start new conversation session
   */
  public startSession(): string {
    this.state.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.state.isActive = true;
    this.state.lastInteraction = Date.now();
    return this.state.sessionId;
  }

  /**
   * End conversation session
   */
  public endSession(): void {
    this.state.isActive = false;
    this.state.currentTopic = undefined;
    this.state.awaitingResponse = false;
  }
}

export const conversationEngine = new ConversationEngine();
