const requestCounts = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  requestCounts.forEach((entry, key) => {
    if (now > entry.resetAt) requestCounts.delete(key);
  });
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  maxRequests?: number,
  windowMs?: number
): RateLimitResult {
  const max = maxRequests ?? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "60", 10);
  const window =
    windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + window;
    requestCounts.set(key, { count: 1, resetAt });
    return { success: true, remaining: max - 1, resetAt };
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
