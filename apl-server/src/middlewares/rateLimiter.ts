import { rateLimit } from 'elysia-rate-limit'

type RateLimitOptions = Partial<Parameters<typeof rateLimit>[0]>

/**
 * ## RateLimiterType
 * This is an enum-like union type used to reference preset strategies
 * for different use cases:
 *
 * - `"login"` → limits login attempts (e.g. POST /login)
 * - `"validate"` → limits validation/token verification (e.g. POST /validate)
 * - `"default"` → fallback rate limit for other routes
 */
export type RateLimiterType =
    | "login"
    | "validate"
    | "default"

/**
 * ## 🏭 RateLimiterFactory
 *
 * A **clean, reusable, and minimalistic factory** for creating rate limiters
 * using [`elysia-rate-limit`](https://github.com/rayriffy/elysia-rate-limit).
 *
 * Each limiter strategy is preconfigured for a specific use case,
 * such as login throttling or validation spam prevention.
 *
 * ---
 *
 * ### 🔧 Usage in an Elysia route:
 * ```ts
 * import { RateLimiterFactory } from '~/middlewares/rateLimiter'
 *
 * new Elysia().use(RateLimiterFactory.for("login"))
 *   .post('/login', ...)
 * ```
 *
 * ---
 *
 * ### 💡 Why a Factory Pattern?
 * - Centralizes config
 * - Makes updates easy
 * - Encourages consistent usage
 */
export class RateLimiterFactory {
    /**
     * ## for()
     * Returns a ready-to-use rate limiter middleware for the specified use case.
     *
     * @param type One of the predefined `RateLimiterType` keys
     * @returns A configured Elysia-compatible rate limit middleware
     */
    static for(type: RateLimiterType) {
        return rateLimit(this.#strategies[type] ?? this.#strategies.default)
    }

    /**
     * ## 🔐 #strategies
     * A private object that maps each `RateLimiterType` to a tailored
     * `rateLimit` configuration. Only the most relevant options are used.
     */
    static #strategies: Record<RateLimiterType, RateLimitOptions> = {
        /**
         * 🟦 Login rate limit
         * - Max 5 requests per minute
         * - Used for POST /login
         * - IP-based throttling
         */
        login: {
            duration: 60_000, // 1 minute
            max: 5,
            errorResponse: "Too many login attempts",
            generator: (req) => req.headers.get("x-forwarded-for") ?? "unknown",
        },

        /**
         * 🟨 Validate token rate limit
         * - Max 3 requests per minute
         * - Used for POST /validate
         * - Fingerprints by email if possible, fallback to IP
         */
        validate: {
            duration: 60_000, // 1 minute
            max: 3,
            errorResponse: "Too many authentication attempts",
            generator: async (req) => {
                const body = await req.clone().json().catch(() => null)
                return (body?.email as string) ?? req.headers.get("x-forwarded-for") ?? "anon"
            },
        },

        /**
         * 🟩 Default strategy
         * - Used for general endpoints or when no strategy is matched
         * - Max 10 requests every 30s
         */
        default: {
            duration: 30_000, // 30 seconds
            max: 10,
            errorResponse: "Too many requests",
            generator: (req) => req.headers.get("x-forwarded-for") ?? "guest",
        },
    }
}
