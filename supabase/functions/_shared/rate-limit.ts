// Simple in-memory rate limiter for Edge Functions
// Uses a Map to track request counts per IP within a time window

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a request should be rate limited.
 * @param identifier - Usually the client IP or user ID
 * @param limit - Max requests per window (default: 30)
 * @param windowMs - Time window in ms (default: 60000 = 1 minute)
 * @returns Object with allowed boolean and headers to attach
 */
export function rateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60_000
): { allowed: boolean; headers: Record<string, string> } {
  const now = Date.now();

  // Clean expired entries periodically
  if (requestCounts.size > 1000) {
    for (const [key, val] of requestCounts) {
      if (val.resetAt < now) requestCounts.delete(key);
    }
  }

  const current = requestCounts.get(identifier);

  if (!current || current.resetAt < now) {
    // New window
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(limit - 1),
      },
    };
  }

  current.count++;

  if (current.count > limit) {
    return {
      allowed: false,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)),
      },
    };
  }

  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(limit - current.count),
    },
  };
}

/**
 * Get the client IP from a request
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
