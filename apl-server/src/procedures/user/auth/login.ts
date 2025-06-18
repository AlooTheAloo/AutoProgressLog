import {Elysia, t} from "elysia";
import {createEmailToken} from "../../../util/auth";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export const loginRoute = new Elysia({name: "login"}).post(
    '/login',
    async ({body, set}) => {
        const {email} = body
        let user = await prisma.user.findUnique({where: {email}})
        if (!user) {
            user = await prisma.user.create({data: {email}})
            set.status = "Created"
        }
        await createEmailToken(user.id)
        //TODO: Send email with magic link
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