import {Elysia, t} from 'elysia'
import prisma from '../db/client'

export const authHeaders = t.Object({
    authorization: t.String({
        pattern: '^Bearer (.+)$',
    })
})

export const authGuard = new Elysia({name: 'auth-guard'})
    .guard({
        headers: authHeaders
    })
    .resolve({as: "scoped"}, async ({headers, set}) => {
        const tokenValue = headers.authorization?.split(' ')[1]

        const token = await prisma.token.findUniqueOrThrow({
            where: {token: tokenValue},
            include: {user: true},
        }).catch(() => {
            set.status = 401
            throw new Error('Invalid or missing session token')
        })


        const now = new Date()

        if (
            !token ||
            !token.valid ||
            token.type !== 'SESSION' ||
            (token.expiration && token.expiration < now)
        ) {
            set.status = 401
            throw new Error('Invalid or expired session token')
        }

        await prisma.token.update({
            where: {id: token.id},
            data: {lastUsedAt: now},
        })

        return {user: token.user, sessionToken: tokenValue}
    })