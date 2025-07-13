interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private clients = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 900000) { // 100 requests per 15 minutes default
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

// Periodic cleanup every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    apiRateLimiter.cleanup();
  }, 300000);
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