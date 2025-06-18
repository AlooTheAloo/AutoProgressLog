import {randomUUID} from 'crypto'
import {PrismaClient} from "@prisma/client";

/**
 * Creates a short-lived magic link token for email login.
 *
 * @param userId - The ID of the user
 * @returns A UUID token valid for 15 minutes
 */
export async function createEmailToken(userId: number) {
    const prisma = new PrismaClient()
    const token = randomUUID()
    await prisma.token.create({
        data: {
            token,
            type: "EMAIL",
            expiration: new Date(Date.now() + 15 * 60 * 1000),
            userId
        }
    })
    return token
}

/**
 * Exchanges a valid magic link token for a long-lived session token.
 *
 * @param email - The user's email
 * @param emailToken - The magic link token
 * @returns A session token string if valid, otherwise null
 */
export async function exchangeEmailTokenForSession(email: string, emailToken: string) {
    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
        where: {email}, include: {tokens: true}
    })
    if (!user) throw new Error("User not found")

    // @ts-ignore
    const validToken = user.tokens.find(t => t.token === emailToken && t.type === "EMAIL" && t.valid && (!t.expiration || t.expiration > Date.now()))
    if (!validToken) throw new Error("Invalid token")

    await prisma.token.update({
        where: {token: emailToken},
        data: {valid: false}
    })

    const sessionToken = randomUUID()
    return prisma.token.create({
        data: {
            token: sessionToken,
            type: "SESSION",
            userId: user.id
        }
    });
}