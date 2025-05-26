/**
 * Advanced caching service for API responses and data optimization
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
  size: number; // Approximate size in bytes
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  compressionEnabled: boolean;
}

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private currentSize = 0; // Current cache size in bytes
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      cleanupInterval: 60 * 1000, // 1 minute cleanup interval
      compressionEnabled: true,
      ...config
    };

    this.startCleanupTimer();
    this.setupStorageEventListener();
  }

  static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const serializedData = JSON.stringify(data);
      const size = new Blob([serializedData]).size;
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        key,
        size
      };

      // Check if adding this entry would exceed max size
      if (this.currentSize + size > this.config.maxSize) {
        this.evictLRU(size);
      }

      // Remove existing entry if it exists
      if (this.cache.has(key)) {
        this.currentSize -= this.cache.get(key)!.size;
      }

      this.cache.set(key, entry);
      this.currentSize += size;

      // Also store in localStorage for persistence
      this.setInLocalStorage(key, entry);

    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Try to get from localStorage
      const storedEntry = this.getFromLocalStorage<T>(key);
      if (storedEntry && !this.isExpired(storedEntry)) {
        // Restore to memory cache
        this.cache.set(key, storedEntry);
        this.currentSize += storedEntry.size;
        return storedEntry.data;
      }
      return null;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
      this.removeFromLocalStorage(key);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.clearLocalStorage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const expired = entries.filter(entry => this.isExpired(entry)).length;
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      currentSize: this.currentSize,
      maxSize: this.config.maxSize,
      utilizationPercent: (this.currentSize / this.config.maxSize) * 100,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null
    };
  }

  /**
   * Cache API response with automatic key generation
   */
  async cacheAPIResponse<T>(
    url: string, 
    fetchFunction: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.generateAPIKey(url);
    
    // Try to get from cache first
    const cachedData = this.get<T>(cacheKey);
    if (cachedData !== null) {
      console.log(`📦 Cache hit for: ${url}`);
      return cachedData;
    }

    // Fetch fresh data
    console.log(`🌐 Cache miss, fetching: ${url}`);
    try {
      const data = await fetchFunction();
      this.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch and cache: ${url}`, error);
      throw error;
    }
  }

  /**
   * Preload data into cache
   */
  async preload<T>(key: string, fetchFunction: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await fetchFunction();
      this.set(key, data, ttl);
      console.log(`🚀 Preloaded cache for: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload cache for: ${key}`, error);
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    let count = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    
    console.log(`🗑️ Invalidated ${count} cache entries matching pattern: ${pattern}`);
    return count;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLRU(requiredSize: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    let freedSize = 0;
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      freedSize += entry.size;
      
      if (freedSize >= requiredSize) {
        break;
      }
    }
    
    console.log(`🧹 Evicted ${freedSize} bytes from cache`);
  }

  private cleanup(): void {
    let cleanedCount = 0;
    let freedSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.currentSize -= entry.size;
        freedSize += entry.size;
        this.cache.delete(key);
        this.removeFromLocalStorage(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries, freed ${freedSize} bytes`);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private generateAPIKey(url: string): string {
    // Create a consistent cache key from URL
    const urlObj = new URL(url, 'https://example.com');
    const params = new URLSearchParams(urlObj.search);
    
    // Sort parameters for consistent keys
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `api:${urlObj.pathname}${sortedParams ? '?' + sortedParams : ''}`;
  }

  private setInLocalStorage(key: string, entry: CacheEntry): void {
    try {
      const storageKey = `omniverse_cache_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      // localStorage might be full or unavailable
      console.warn('Failed to store in localStorage:', error);
    }
  }

  private getFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    try {
      const storageKey = `omniverse_cache_${key}`;
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      const storageKey = `omniverse_cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      // Ignore errors
    }
  }

  private clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('omniverse_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Ignore errors
    }
  }

  private setupStorageEventListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.cleanupTimer) {
          clearInterval(this.cleanupTimer);
        }
      });
    }
  }

  /**
   * Destroy the cache instance
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance({
  maxSize: 50 * 1024 * 1024, // 50MB
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  compressionEnabled: true
});

// Cache keys for different data types
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  SEARCH_RESULTS: 'search_results',
  VOICE_SEARCH: 'voice_search',
  USER_PREFERENCES: 'user_preferences',
  API_HEALTH: 'api_health',
  SELLERS: 'sellers',
  OFFERS: 'offers'
} as const;
