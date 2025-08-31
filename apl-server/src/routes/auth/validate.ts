import {Elysia, t} from 'elysia';
import {exchangeEmailTokenForSession} from '../../services/auth/token';

/**
 * ## POST /validate
 *
 * This endpoint is the second half of the passwordless login flow.
 *
 * After a user clicks the **magic link** sent to their email (containing a one-time token),
 * the frontend submits the token here to:
 * - ✅ Validate the email + token combination
 * - ✅ Issue a persistent session token
 * - ✅ Register device fingerprinting metadata (device ID, name, user agent)
 *
 * ---
 *
 * ### 🧠 Step-by-step logic:
 * 1. Accepts body with:
 *    - `email`: user identity
 *    - `emailToken`: one-time token from magic link
 *    - `deviceId`, `deviceName`, `userAgent`: fingerprinting metadata
 * 2. Validates the email/token pair using `exchangeEmailTokenForSession()`
 * 3. On success, returns a new long-lived session token and `createdAt` timestamp
 * 4. On failure, returns a 400 error with a message
 *
 * ---
 *
 * ### 🧪 Example usage (Eden):
 * ```ts
 * import { eden } from '@elysiajs/eden';
 * import type { APLServer } from '~/server';
 *
 * const api = eden<typeof APLServer>('https://api.autoprogresslog.com');
 *
 * const res = await api.auth.validate({
 *   email: 'youssef@youssef.dev',
 *   emailToken: 'abc123-token-here',
 *   deviceId: 'unique-device-id',
 *   deviceName: 'Bob’s MacBook Air',
 *   userAgent: 'Electron 28.0.0'
 * });
 *
 * const token = res.token; // ✅ Use in Authorization header for future requests
 * ```
 *
 * ---
 *
 * ### 🔒 Security Considerations
 * - Email token must be valid and not expired
 * - Session token is persistent and must be stored securely on the client
 * - Fingerprinting data helps with session management and analytics
 */
export const validateRoute = new Elysia({name: 'validate-token'}).post(
    '/validate',
    async ({body, set}) => {
        const {email, emailToken, deviceId, deviceName, userAgent} = body;

        try {
            const dbToken = await exchangeEmailTokenForSession(email, emailToken, {
                deviceId,
                deviceName,
                userAgent,
            });

            return {
                token: dbToken.token,
                createdAt: dbToken.createdAt,
            };
        } catch (e: any) {
            set.status = 400;
            throw new Error(e.message);
        }
    },
    {
        body: t.Object({
            email: t.String({
                format: 'email',
                example: 'youssef@youssef.dev',
            }),
            emailToken: t.String({
                example: '4f5c54c6-1234-abc123',
            }),
            deviceId: t.String({
                example: 'device-uuid-xyz',
            }),
            deviceName: t.String({
                example: 'Bob’s MacBook Air',
            }),
            userAgent: t.String({
                example: 'Electron 28.0.0',
            }),
        }),
        response: t.Union([
            t.Object({
                token: t.String({description: 'Persistent session token'}),
                createdAt: t.Date(),
            }),
            t.Object({
                error: t.String(),
            }),
        ]),
        detail: {
            summary: 'Validate magic link token and create session',
            tags: ['Auth'],
            description: `Validates a short-lived email token and issues a persistent session token with device fingerprinting info.`,
        },
    }
);
