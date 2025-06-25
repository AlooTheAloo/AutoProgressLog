import {Elysia, t} from 'elysia'
import {exchangeEmailTokenForSession} from '../../services/auth/token'

export const validateRoute = new Elysia({name: 'validate-token'}).post(
    '/validate',
    async ({body, set}) => {
        const {email, emailToken, deviceId, deviceName, userAgent} = body
        try {
            const dbToken = await exchangeEmailTokenForSession(email, emailToken, {
                deviceId,
                deviceName,
                userAgent,
            })

            return {
                token: dbToken.token,
                createdAt: dbToken.createdAt,
            }
        } catch (e: any) {
            set.status = 400
            throw new Error(e.message)
        }
    },
    {
        body: t.Object({
            email: t.String({format: 'email', example: 'youssef@youssef.dev'}),
            emailToken: t.String({example: '4f5c54c6-1234-abc123'}),
            deviceId: t.String({example: 'device-uuid-xyz'}),
            deviceName: t.String({example: 'Bob’s MacBook Air'}),
            userAgent: t.String({example: 'Electron 28.0.0'}),
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
)
