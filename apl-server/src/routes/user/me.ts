import {Elysia, t} from "elysia";
import client from "../../db/client";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {UserPlain} from "../../../prisma/types/User";

const PublicUser = t.Omit(UserPlain, ["id"]);
const PublicMutateUser = t.Omit(UserPlain, ["id", "profilePicture"]);

export const meRoutes = new Elysia({name: "me-routes"})
    .use(authGuard)
    .get(
        "/me",
        async ({user}) => {
            const {id, ...publicUser} = user;
            return publicUser;
        },
        {
            headers: authHeaders,
            response: t.Nullable(PublicUser),
            detail: {
                description: "Get the current authenticated user",
                tags: ["User"],
                summary: "Get Current User",
            },
        }
    )
    .patch(
        "/me",
        async ({user, body, set}) => {
            if (body.userName) {
                if (body.userName.length > 100) {
                    set.status = 400;
                    return {
                        description: "Username cannot exceed 100 characters",
                    };
                }
            }
            const updatedUser = await client.user.update({
                where: {id: user.id},
                data: body,
            });
            return {
                email: updatedUser.email,
                userName: updatedUser.userName,
                profilePicture: updatedUser.profilePicture,
            };
        },
        {
            headers: authHeaders,
            body: PublicMutateUser,
            response: {
                200: t.Nullable(PublicUser),
                400: t.Object({description: t.String()})
            },
            detail: {
                description: "Update the current authenticated user",
                tags: ["User"],
                summary: "Update Current User",
            },
        }
    );
