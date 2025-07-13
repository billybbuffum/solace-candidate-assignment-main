interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum number of cached entries

  set<T>(key: string, data: T, ttlMs = 300000): void { // 5 minute default TTL
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const searchCache = new MemoryCache();

// Periodic cleanup every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    searchCache.cleanup();
  }, 300000);
}

// Generate cache key for search parameters
export function generateCacheKey(params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((sorted, key) => {
      if (params[key] !== undefined && params[key] !== '') {
        sorted[key] = params[key];
      }
      return sorted;
    }, {} as Record<string, any>);

  return `search:${JSON.stringify(sortedParams)}`;
}