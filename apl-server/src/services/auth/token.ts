import {randomUUID} from 'crypto'
import prisma from '../../db/client'

/**
 * Creates a short-lived magic link token for email login.
 *
 * @param userId - The ID of the user
 * @returns A UUID token valid for 15 minutes
 */
export async function createEmailToken(userId: number) {
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
 * @param device - Optional device fingerprinting info
 * @returns A new session token
 * @throws If the user or token is invalid
 */

export async function exchangeEmailTokenForSession(
    email: string,
    emailToken: string,
    device?: { deviceId?: string; deviceName?: string; userAgent?: string }) {
    const user = await prisma.user.findUniqueOrThrow({
        where: {email},
        include: {tokens: true}
    }).catch(() =>{
        throw new Error('The specified email is not associated with any account')
    })

    const dbToken = user.tokens.find(t => t.token === emailToken && t.type === "EMAIL" && (t.expiration && t.expiration > new Date()))

    if (!dbToken) {
        throw new Error("Invalid or expired token")
    }

    // Create a new session token
    const sessionToken = randomUUID()
    return prisma.token.create({
        data: {
            token: sessionToken,
            type: "SESSION",
            userId: user.id,
            deviceId: device?.deviceId,
            deviceName: device?.deviceName,
            userAgent: device?.userAgent,
        },
    })
}