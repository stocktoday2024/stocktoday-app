/**
 * Rate Limiter for Authentication & Sensitive Endpoints
 * In-memory sliding-window counter suitable for Next.js server runtime.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Check if a client has exceeded allowed attempts within the timeframe.
 * @param identifier IP or user email
 * @param maxAttempts maximum requests permitted in window
 * @param windowMs window in milliseconds (default 15 minutes)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(identifier, newRecord);
    return { allowed: true, remaining: maxAttempts - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}
