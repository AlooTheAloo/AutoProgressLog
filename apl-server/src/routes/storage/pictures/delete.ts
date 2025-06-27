import {Elysia, t} from "elysia";
import {authGuard, authHeaders} from "../../../middlewares/authGuard";
import client from "../../../db/client";

export const deleteRoute = new Elysia({name: 'delete-route'}).use(authGuard)
    .delete('/delete', async ({user, set}) => {
            const res = await fetch(`http://apl-storage:2727/pictures/delete/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                set.status = res.status;
                return {error: 'Failed to delete picture'};
            }

            // Update user profile picture URL in the database
            await client.user.update({
                where: {id: user.id},
                data: {profilePicture: null}
            }).catch(err => {
                console.error('Failed to update user picture URL:', err);
            });

            return await res.json()
        },
        {
            headers: authHeaders,
            response: t.Object({
                message: t.String({description: 'Success message'})
            }),
            detail: {
                tags: ['Storage'],
                summary: 'Delete a picture',
                description: 'Deletes a user\'s profile picture from the storage service and updates the user profile picture URL in the database.'
            }
        })