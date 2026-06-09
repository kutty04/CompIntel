// In-Memory Production-Safe Rate Limiter

const ipCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Lightweight, in-memory rate limiter to prevent abuse on key POST endpoints.
 * @param ip Client IP address
 * @param limit Maximum allowed requests within the duration
 * @param durationMs Duration window in milliseconds
 * @returns boolean True if request is allowed, false if rate limit exceeded
 */
export function rateLimit(ip: string, limit: number, durationMs: number): boolean {
  const now = Date.now();
  const client = ipCache.get(ip);

  if (!client) {
    ipCache.set(ip, { count: 1, resetTime: now + durationMs });
    return true;
  }

  // Window expired, reset limit
  if (now > client.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + durationMs });
    return true;
  }

  // Check if limit exceeded
  if (client.count >= limit) {
    return false;
  }

  // Increment request count
  client.count++;
  return true;
}
