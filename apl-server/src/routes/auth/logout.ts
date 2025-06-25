import {Elysia, t} from 'elysia'
import client from '../../db/client'
import {authGuard, authHeaders} from '../../middlewares/authGuard'

export const logoutRoutes = new Elysia({name: 'logout-routes'}).use(authGuard)

    /**
     * Logs out the current session, or a specific session owned by the user.
     */
    .post(
        '/logout',
        async ({user, sessionToken, body, set}) => {
            const targetToken = body?.token ?? sessionToken

           await client.token.findUniqueOrThrow({
                where: {token: targetToken, type: 'SESSION', userId: user.id, valid: true},
            }).catch(() => {
                set.status = 401
                throw new Error('The provided session token is invalid or does not belong to the authenticated user')
            })

            await client.token.update({
                where: {token: targetToken},
                data: {
                    valid: false,
                    lastUsedAt: new Date(),
                },
            })

            set.status = 204
            return
        },
        {
            body: t.Union([t.Object({token: t.String()}), t.Null()]),
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
     * Logs out all sessions owned by the authenticated user.
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
            })

            set.status = 204
            return
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
    )
