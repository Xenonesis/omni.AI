/**
 * Input sanitization utilities for security and data validation
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;'
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  return text.replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match);
};

/**
 * Remove HTML tags from string
 */
export const stripHtml = (html: string): string => {
  if (typeof html !== 'string') {
    return String(html);
  }
  
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Sanitize search query input
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') {
    return '';
  }
  
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-.,!?()]/g, '') // Allow only safe characters
    .substring(0, 200); // Limit length
};

/**
 * Sanitize user name input
 */
export const sanitizeName = (name: string): string => {
  if (typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim()
    .replace(/[<>]/g, '')
    .replace(/[^\w\s\-.']/g, '')
    .substring(0, 100);
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '')
    .substring(0, 254); // RFC 5321 limit
};

/**
 * Sanitize phone number input
 */
export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') {
    return '';
  }
  
  return phone
    .replace(/[^\d\s\-+()]/g, '')
    .trim()
    .substring(0, 20);
};

/**
 * Sanitize URL input
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') {
    return '';
  }
  
  // Only allow http/https URLs
  const urlPattern = /^https?:\/\//i;
  if (!urlPattern.test(url)) {
    return '';
  }
  
  try {
    const parsedUrl = new URL(url);
    // Only allow specific domains for security
    const allowedDomains = [
      'youtube.com',
      'www.youtube.com',
      'youtu.be',
      'backend.omnidim.io',
      'api.omniverse.ai'
    ];
    
    if (!allowedDomains.some(domain => parsedUrl.hostname === domain)) {
      return '';
    }
    
    return parsedUrl.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize API response data
 */
export const sanitizeApiResponse = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    return escapeHtml(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeApiResponse);
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[escapeHtml(key)] = sanitizeApiResponse(value);
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Validate and sanitize product data
 */
export const sanitizeProductData = (product: any): any => {
  if (!product || typeof product !== 'object') {
    return null;
  }
  
  return {
    id: String(product.id || '').substring(0, 50),
    name: sanitizeName(product.name || ''),
    description: escapeHtml(String(product.description || '')).substring(0, 1000),
    price: Math.max(0, Number(product.price) || 0),
    rating: Math.min(5, Math.max(0, Number(product.rating) || 0)),
    category: sanitizeName(product.category || ''),
    brand: sanitizeName(product.brand || ''),
    image: sanitizeUrl(product.image || ''),
    seller: sanitizeName(product.seller || ''),
    availability: Boolean(product.availability),
    reviews: Math.max(0, Number(product.reviews) || 0)
  };
};

/**
 * Validate input length
 */
export const validateLength = (input: string, min: number, max: number): boolean => {
  if (typeof input !== 'string') {
    return false;
  }
  
  const length = input.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]{10,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Global rate limiter instances
export const searchRateLimiter = new RateLimiter(20, 60000); // 20 searches per minute
export const voiceRateLimiter = new RateLimiter(30, 60000); // 30 voice requests per minute
export const apiRateLimiter = new RateLimiter(100, 60000); // 100 API calls per minute
