import {Elysia, t} from "elysia";
import client from "../../db/client";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {__nullable__} from "../../../prisma/types/__nullable__";
import {UserPlain} from "../../../prisma/types/User";

const PublicUser = t.Omit(UserPlain, ["id"])
const PublicMutateUser = t.Omit(UserPlain, ["id", "profilePicture"])

export const meRoutes = new Elysia({name: "me-routes"})
    .use(authGuard)
    .get("/me", async ({user}) => {
        return {
            ...user,
            id: undefined
        }
    }, {
        headers: authHeaders,
        response: __nullable__(PublicUser),
        detail: {
            description: "Get the current authenticated user",
            tags: ["User"],
            summary: "Get Current User"
        }
    })
    .patch("/me", async ({user, body}) => {
        const updatedUser = await client.user.update({
            where: {id: user.id},
            data: body
        });

        return {
            ...updatedUser,
            id: undefined
        }
    }, {
        headers: authHeaders,
        body: PublicMutateUser,
        response: __nullable__(PublicUser),
        detail: {
            description: "Update the current authenticated user",
            tags: ["User"],
            summary: "Update Current User"
        }
    })
