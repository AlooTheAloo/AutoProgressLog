import {Elysia, t} from "elysia";
import {createEmailToken} from "../../services/auth/token";
import prisma from "../../db/client";
import {sendMagicLink} from "../../services/email/sendMagicLink";

export const loginRoute = new Elysia({name: "login"}).post(
    '/login',
    async ({body, set}) => {
        const {email} = body
        let user = await prisma.user.findUnique({where: {email}})
        if (!user) {
            user = await prisma.user.create({data: {email}})
            set.status = "Created"
        }
        const token = await createEmailToken(user.id)
        await sendMagicLink(email, token)
        return
    },
    {
        body: t.Object({
            email: t.String({
                format: 'email',
                example: 'youssef@youssef.dev'
            })
        }),
        response: t.Void(),
        detail: {
            summary: 'Login',
            tags: ['Auth'],
            description: 'Login a user with email',
        }
    }
)