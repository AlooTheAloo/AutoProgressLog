import {Elysia, t} from 'elysia';
import client from '../../db/client';
import {authGuard, authHeaders} from '../../middlewares/authGuard';

/**
 * ## 🔐 Auth: Logout Routes
 *
 * This plugin handles user **session termination**, either for:
 * - The current session (default)
 * - A specified session (via token)
 * - All active sessions (logout-all)
 *
 * ---
 *
 * ⚠️ All routes below require authentication (`authGuard`) to inject `user` and `sessionToken`.
 */
export const logoutRoutes = new Elysia({name: 'logout-routes'}).use(authGuard)

    /**
     * ## POST /logout
     *
     * Logs out:
     * - 🔓 The current session by default (uses the provided `sessionToken`)
     * - 🔑 OR a specific session if a `token` is provided in the body
     *
     * ---
     *
     * ### 🧠 What it does:
     * 1. Resolves the `token` to revoke:
     *    - Uses `body.token` if provided
     *    - Otherwise uses the current session’s token (`sessionToken`)
     * 2. Ensures:
     *    - Token is of type `'SESSION'`
     *    - Belongs to the current user
     *    - Is still valid
     * 3. Marks it as invalid and updates `lastUsedAt`
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * // Logs out the current session
     * await api.auth.logout();
     *
     * // Logs out a specific session by token
     * await api.auth.logout({ token: 'abc.def.ghi' });
     * ```
     *
     * ---
     *
     * ### 🔄 Response:
     * - ✅ `204 No Content` on success
     * - ❌ `401 Unauthorized` if the token is not valid or not owned
     */
    .post(
        '/logout',
        async ({user, sessionToken, body, set}) => {
            // Use provided token or fallback to current session token
            const targetToken = body?.token ?? sessionToken;

            // Ensure token exists, is valid, belongs to the current user
            await client.token.findUniqueOrThrow({
                where: {
                    token: targetToken,
                    type: 'SESSION',
                    userId: user.id,
                    valid: true,
                },
            }).catch(() => {
                set.status = 401;
                throw new Error('The provided session token is invalid or does not belong to the authenticated user');
            });

            // Revoke the session
            await client.token.update({
                where: {token: targetToken},
                data: {
                    valid: false,
                    lastUsedAt: new Date(),
                },
            });

            set.status = 204; // No Content
            return;
        },
        {
            body: t.Union([
                t.Object({token: t.String()}),
                t.Null()
            ]),
            response: t.Void(),
            headers: authHeaders,
            detail: {
                summary: 'Log out session',
                tags: ['Auth'],
                description: `Logs out the current session by default. 
                      If a token is provided in the body, revokes that session 
                      (only if owned by the authenticated user).`,
            },
        }
    )

    /**
     * ## POST /logout-all
     *
     * Logs the user out from **all devices** and sessions.
     *
     * ---
     *
     * ### 🧠 What it does:
     * 1. Revokes all session tokens for the authenticated `user.id`
     * 2. Marks them as `valid: false` and updates `lastUsedAt`
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * await api.auth.logoutAll();
     * ```
     *
     * ---
     *
     * ### 🔄 Response:
     * - ✅ `204 No Content`
     */
    .post(
        '/logout-all',
        async ({user, set}) => {
            await client.token.updateMany({
                where: {
                    userId: user.id,
                    type: 'SESSION',
                },
                data: {
                    valid: false,
                    lastUsedAt: new Date(),
                },
            });

            set.status = 204;
            return;
        },
        {
            response: t.Void(),
            headers: authHeaders,
            detail: {
                summary: 'Log out all sessions',
                tags: ['Auth'],
                description: 'Logs out all active sessions for the authenticated user (from all devices).',
            },
        }
    );
