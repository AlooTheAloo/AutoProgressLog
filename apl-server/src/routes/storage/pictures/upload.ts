import {Elysia, t} from "elysia";
import {authGuard, authHeaders} from "../../../middlewares/authGuard";
import client from "../../../db/client";

export const uploadRoute = new Elysia({name: 'upload-route'}).use(authGuard)
    .post('/upload', async ({user, body, set}) => {
        const form = new FormData();
        form.append('file', body.file);

        const res = await fetch(`http://apl-storage:2727/pictures/upload/${user.id}`, {
            method: 'POST',
            body: form,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (!res.ok) {
            set.status = res.status;
            return {error: 'Failed to upload picture'};
        }

        client.user.update({
            where: {id: user.id},
            data: {profilePicture: `/storage/pictures/fetch/${user.id}`}
        }).catch(err => {
            console.error('Failed to update user picture URL:', err);
        })

        return res.json()
    }, {
        body: t.Object({
            file: t.File()
        }),
        headers: authHeaders,
        response: {
            200: t.Object({
                description: t.String(),
            }),
            400: t.Object({
                description: t.String()
            }),
            500: t.Object({
                description: t.String()
            })
        },
        detail:{
            tags: ['Storage'],
            summary: 'Upload a picture',
            description: 'Uploads a picture to the storage service and updates the user profile picture URL.'
        }
    })