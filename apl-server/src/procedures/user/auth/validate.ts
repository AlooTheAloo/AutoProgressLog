import {Elysia, t} from 'elysia'
import {exchangeEmailTokenForSession} from '../../../util/auth'

export const validateRoute = new Elysia({name: 'validate-token'}).post(
    '/validate',
    async ({body, set}) => {
        const {email, emailToken} = body
        const dbToken = await exchangeEmailTokenForSession(email, emailToken)
        if (!dbToken) {
            set.status = 401
            return {error: 'Invalid or expired token'}
        }
        return {token: dbToken.token}
    },
    {
        body: t.Object({
            email: t.String({format: 'email', example: 'youssef@youssef.dev'}),
            emailToken: t.String({example: '4f5c54c6-1234-abc123'}),
        }),
        response: t.Union([
            t.Object({
                token: t.String({description: 'Persistent session token'}),
            }),
            t.Object({
                error: t.String(),
            }),
        ]),
        detail: {
            summary: 'Authenticate user with magic link',
            tags: ['Auth'],
            description: 'Exchanges a valid magic link for a long-lived session token',
        },
    }
)
