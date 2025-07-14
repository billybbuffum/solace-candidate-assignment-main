interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private clients = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;

  constructor(
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes default
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const client = this.clients.get(clientId);

    // If no entry exists or window has expired, create new entry
    if (!client || now > client.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.clients.set(clientId, newEntry);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Check if limit exceeded
    if (client.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: client.resetTime,
      };
    }

    // Increment count and allow request
    client.count++;
    this.clients.set(clientId, client);

    return {
      allowed: true,
      remaining: this.maxRequests - client.count,
      resetTime: client.resetTime,
    };
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [clientId, entry] of this.clients.entries()) {
      if (now > entry.resetTime) {
        this.clients.delete(clientId);
      }
    }
  }
}

// Global rate limiter instance
export const apiRateLimiter = new RateLimiter();

// Periodic cleanup
if (typeof window === 'undefined') { // Only run on server
  const cleanupInterval = parseInt(process.env.RATE_LIMIT_CLEANUP_INTERVAL_MS || '300000'); // 5 minutes default
  setInterval(() => {
    apiRateLimiter.cleanup();
  }, cleanupInterval);
}

// Get client identifier from request
export function getClientId(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || '';
  
  // Create hash of IP + User Agent for privacy
  return `${ip}:${userAgent.slice(0, 50)}`;
}