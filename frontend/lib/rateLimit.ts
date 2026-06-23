// Free, in-memory rate limiter — no external service required.
// Per-process only (resets on redeploy/restart), which is an acceptable
// trade-off for this app's scale; mirrors the pattern already used in
// app/api/auth/signup/route.ts.

interface Bucket { count: number; windowStart: number }

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSecs: number;
}

/**
 * @param key unique bucket key, e.g. `${routeName}:${ip}` or `${routeName}:${userId}`
 * @param limit max requests allowed within windowMs
 * @param windowMs window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.windowStart + windowMs - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}

export function rateLimitResponseInit(retryAfterSecs: number, limit: number): ResponseInit {
  return {
    status: 429,
    headers: {
      'Retry-After': String(retryAfterSecs),
      'X-RateLimit-Limit': String(limit),
    },
  };
}
