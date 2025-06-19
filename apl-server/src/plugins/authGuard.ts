import {Elysia} from 'elysia'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export const authGuard = new Elysia({name: 'auth-guard'}).derive(async ({headers, set}) => {
    const authHeader = headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        throw new Error('Missing or invalid Authorization header')
    }

    const tokenValue = authHeader.split(' ')[1]

    const token = await prisma.token.findUnique({
        where: {token: tokenValue},
        include: {user: true},
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
