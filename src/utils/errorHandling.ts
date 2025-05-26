/**
 * Comprehensive error handling utilities
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stack?: string;
  userMessage: string;
}

export enum ErrorCodes {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  
  // Voice errors
  MICROPHONE_ACCESS_DENIED = 'MICROPHONE_ACCESS_DENIED',
  SPEECH_RECOGNITION_FAILED = 'SPEECH_RECOGNITION_FAILED',
  VOICE_SYNTHESIS_FAILED = 'VOICE_SYNTHESIS_FAILED',
  
  // Search errors
  SEARCH_FAILED = 'SEARCH_FAILED',
  INVALID_SEARCH_QUERY = 'INVALID_SEARCH_QUERY',
  NO_RESULTS_FOUND = 'NO_RESULTS_FOUND',
  
  // Product errors
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
  PRICE_FETCH_FAILED = 'PRICE_FETCH_FAILED',
  
  // Cart errors
  CART_UPDATE_FAILED = 'CART_UPDATE_FAILED',
  CHECKOUT_FAILED = 'CHECKOUT_FAILED',
  
  // Authentication errors
  AUTH_FAILED = 'AUTH_FAILED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  FEATURE_UNAVAILABLE = 'FEATURE_UNAVAILABLE'
}

const ERROR_MESSAGES: Record<ErrorCodes, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorCodes.API_TIMEOUT]: 'The request took too long to complete. Please try again.',
  [ErrorCodes.API_UNAVAILABLE]: 'Our services are temporarily unavailable. Please try again later.',
  
  [ErrorCodes.MICROPHONE_ACCESS_DENIED]: 'Microphone access is required for voice search. Please enable microphone permissions.',
  [ErrorCodes.SPEECH_RECOGNITION_FAILED]: 'Could not understand your voice. Please try speaking more clearly.',
  [ErrorCodes.VOICE_SYNTHESIS_FAILED]: 'Unable to play voice response. Please check your audio settings.',
  
  [ErrorCodes.SEARCH_FAILED]: 'Search failed. Please try again with different keywords.',
  [ErrorCodes.INVALID_SEARCH_QUERY]: 'Please enter a valid search query.',
  [ErrorCodes.NO_RESULTS_FOUND]: 'No products found matching your search. Try different keywords.',
  
  [ErrorCodes.PRODUCT_NOT_FOUND]: 'Product not found. It may have been removed or is no longer available.',
  [ErrorCodes.PRODUCT_UNAVAILABLE]: 'This product is currently unavailable.',
  [ErrorCodes.PRICE_FETCH_FAILED]: 'Unable to fetch current price. Please refresh and try again.',
  
  [ErrorCodes.CART_UPDATE_FAILED]: 'Failed to update cart. Please try again.',
  [ErrorCodes.CHECKOUT_FAILED]: 'Checkout failed. Please verify your information and try again.',
  
  [ErrorCodes.AUTH_FAILED]: 'Authentication failed. Please check your credentials.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment before trying again.',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorCodes.FEATURE_UNAVAILABLE]: 'This feature is currently unavailable.'
};

export class AppErrorHandler {
  private static instance: AppErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): AppErrorHandler {
    if (!AppErrorHandler.instance) {
      AppErrorHandler.instance = new AppErrorHandler();
    }
    return AppErrorHandler.instance;
  }

  createError(
    code: ErrorCodes,
    originalError?: Error | any,
    details?: any
  ): AppError {
    const error: AppError = {
      code,
      message: originalError?.message || ERROR_MESSAGES[code],
      userMessage: ERROR_MESSAGES[code],
      timestamp: new Date().toISOString(),
      details,
      stack: originalError?.stack
    };

    this.logError(error);
    return error;
  }

  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Keep only the most recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', error);
    }

    // In production, you would send this to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.reportToService(error);
    }
  }

  private reportToService(error: AppError): void {
    // Replace with your actual error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    try {
      // Example implementation:
      // Sentry.captureException(new Error(error.message), {
      //   tags: { code: error.code },
      //   extra: error.details
      // });
      
      console.warn('Error reporting service not configured:', error.code);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(0, count);
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  handleNetworkError(error: any): AppError {
    if (error.name === 'AbortError') {
      return this.createError(ErrorCodes.API_TIMEOUT, error);
    }
    
    if (error.message?.includes('fetch')) {
      return this.createError(ErrorCodes.NETWORK_ERROR, error);
    }
    
    return this.createError(ErrorCodes.API_UNAVAILABLE, error);
  }

  handleVoiceError(error: any): AppError {
    if (error.name === 'NotAllowedError') {
      return this.createError(ErrorCodes.MICROPHONE_ACCESS_DENIED, error);
    }
    
    if (error.name === 'NotSupportedError') {
      return this.createError(ErrorCodes.SPEECH_RECOGNITION_FAILED, error);
    }
    
    return this.createError(ErrorCodes.VOICE_SYNTHESIS_FAILED, error);
  }

  handleSearchError(error: any, query?: string): AppError {
    if (query && query.trim().length === 0) {
      return this.createError(ErrorCodes.INVALID_SEARCH_QUERY, error);
    }
    
    return this.createError(ErrorCodes.SEARCH_FAILED, error, { query });
  }
}

// Utility functions for common error scenarios
export const handleApiError = (error: any): AppError => {
  const handler = AppErrorHandler.getInstance();
  
  if (error.response) {
    // HTTP error response
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return handler.createError(ErrorCodes.VALIDATION_ERROR, error);
      case 401:
        return handler.createError(ErrorCodes.AUTH_FAILED, error);
      case 403:
        return handler.createError(ErrorCodes.AUTH_FAILED, error);
      case 404:
        return handler.createError(ErrorCodes.PRODUCT_NOT_FOUND, error);
      case 429:
        return handler.createError(ErrorCodes.RATE_LIMIT_EXCEEDED, error);
      case 500:
      case 502:
      case 503:
      case 504:
        return handler.createError(ErrorCodes.API_UNAVAILABLE, error);
      default:
        return handler.createError(ErrorCodes.UNKNOWN_ERROR, error);
    }
  }
  
  return handler.handleNetworkError(error);
};

export const handleVoiceError = (error: any): AppError => {
  const handler = AppErrorHandler.getInstance();
  return handler.handleVoiceError(error);
};

export const handleSearchError = (error: any, query?: string): AppError => {
  const handler = AppErrorHandler.getInstance();
  return handler.handleSearchError(error, query);
};

// Error boundary helper
export const logErrorToBoundary = (error: Error, errorInfo: any): void => {
  const handler = AppErrorHandler.getInstance();
  handler.createError(ErrorCodes.UNKNOWN_ERROR, error, errorInfo);
};

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const handler = AppErrorHandler.getInstance();
    handler.createError(ErrorCodes.UNKNOWN_ERROR, event.reason);
    console.error('Unhandled promise rejection:', event.reason);
  });
}

export default AppErrorHandler;
