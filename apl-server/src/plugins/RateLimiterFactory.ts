import {rateLimit} from 'elysia-rate-limit'

type RateLimitOptions = Partial<Parameters<typeof rateLimit>[0]>

export type RateLimiterType =
    | 'login'
    | 'validate'
    | 'default'

/**
 * Clean, maintainable rate limiter factory using only necessary config.
 */
export class RateLimiterFactory {
    static for(type: RateLimiterType) {
        return rateLimit(this.#strategies[type] ?? this.#strategies.default)
    }

    static #strategies: Record<RateLimiterType, RateLimitOptions> = {
        login: {
            duration: 60_000,
            max: 5,
            errorResponse: 'Too many login attempts',
            generator: (req) => req.headers.get('x-forwarded-for') ?? 'unknown',
        },

        validate: {
            duration: 60_000,
            max: 3,
            errorResponse: 'Too many authentication attempts',
            generator: async (req) => {
                const body = await req.clone().json().catch(() => null)
                return (body?.email as string) ?? req.headers.get('x-forwarded-for') ?? 'anon'
            },
        },

        default: {
            duration: 30_000,
            max: 10,
            errorResponse: 'Too many requests',
            generator: (req) => req.headers.get('x-forwarded-for') ?? 'guest',
        },
    }
}
