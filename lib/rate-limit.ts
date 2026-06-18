interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
        if (now > entry.resetAt) store.delete(key);
    }
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 30;

/**
 * Simple in-memory rate limiter. Returns `true` when the request is allowed.
 *
 * For production, replace with @upstash/ratelimit or similar distributed solution.
 */
export function checkRateLimit(
    key: string,
    maxRequests: number = DEFAULT_MAX_REQUESTS,
    windowMs: number = DEFAULT_WINDOW_MS,
): { allowed: boolean; remaining: number; resetAt: number } {
    cleanup();

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    entry.count++;
    if (entry.count > maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/** Derive a rate-limit key from the request (IP + route). */
export function rateLimitKey(request: Request, route: string): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
    return `rl:${route}:${ip}`;
}

/** Convenience: check rate limit and return a 429 Response if exceeded. */
export function withRateLimit(
    request: Request,
    route: string,
    maxRequests?: number,
    windowMs?: number,
): Response | null {
    const key = rateLimitKey(request, route);
    const result = checkRateLimit(key, maxRequests, windowMs);

    if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
        return new Response(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Remaining': '0',
                },
            },
        );
    }

    return null;
}
