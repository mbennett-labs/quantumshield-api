// ===========================================
// QUANTUMSHIELD API - SHARED CACHE UTILITY
// ===========================================
// In-memory cache with TTL support
// For production at scale, consider Redis/Vercel KV

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 60 seconds
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Get cached value if exists and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache value with TTL in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new MemoryCache();

// ===========================================
// CACHE TTL CONSTANTS (in milliseconds)
// ===========================================
export const CACHE_TTL = {
  TOKEN_SECURITY: 5 * 60 * 1000,      // 5 minutes - token data changes rarely
  HONEYPOT: 5 * 60 * 1000,            // 5 minutes
  WALLET_RISK: 1 * 60 * 1000,         // 1 minute - more dynamic
  CONTRACT_AUDIT: 24 * 60 * 60 * 1000, // 24 hours - contracts don't change
  LIQUIDITY: 5 * 60 * 1000,           // 5 minutes
  WHALE_ACTIVITY: 1 * 60 * 1000,      // 1 minute - changes frequently
  PAIR_ANALYSIS: 5 * 60 * 1000,       // 5 minutes
} as const;

// ===========================================
// CACHE KEY GENERATORS
// ===========================================
export function cacheKey(prefix: string, address: string, chainId: string): string {
  return `${prefix}:${chainId}:${address.toLowerCase()}`;
}
