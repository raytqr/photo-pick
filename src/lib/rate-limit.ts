/**
 * Simple in-memory rate limiter for Next.js
 * Note: Resets on server restart/redeploy
 * For production at scale, consider Upstash Redis
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Time window in seconds */
    windowSeconds: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // seconds until reset
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = { maxRequests: 5, windowSeconds: 60 }
): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const key = `rl:${identifier}`;

    const entry = rateLimitStore.get(key);

    // If no entry or window expired, create new entry
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowSeconds,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
    /** Strict: 5 requests per minute (for login/register) */
    auth: { maxRequests: 5, windowSeconds: 60 },

    /** Standard: 30 requests per minute (for API calls) */
    api: { maxRequests: 30, windowSeconds: 60 },

    /** Relaxed: 100 requests per minute (for read-only endpoints) */
    read: { maxRequests: 100, windowSeconds: 60 },
};
