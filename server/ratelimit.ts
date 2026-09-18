import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window per IP
  message?: string;
}

/**
 * Creates a reusable Express rate-limiting middleware.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // Default 15 minutes
  const maxRequests = options.maxRequests || 100;
  const message = options.message || 'Too many requests from this IP, please try again later.';

  const ipStore = new Map<string, RateLimitRecord>();

  // Periodically cleanup expired entries every 10 minutes to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 10 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = ipStore.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipStore.set(ip, record);
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds,
      });
    }

    next();
  };
}

// Pre-configured rate limiters for sensitive endpoints
export const apiGeneralLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 300,
  message: 'API rate limit exceeded. Please slow down.',
});

export const authLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 15, // 15 login/auth attempts per 10 min
  message: 'Too many authentication attempts. Please try again after 10 minutes.',
});

export const sensitiveWriteLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 50, // 50 write operations per 5 min
  message: 'Rate limit exceeded for sensitive write operations.',
});
