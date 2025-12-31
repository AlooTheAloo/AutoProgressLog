import {Elysia, t} from "elysia";
import {authGuard, authHeaders} from "../../../middlewares/authGuard";
import client from "../../../db/client";

const MAX_FILE_SIZE = 6.7 * 1024 * 1024; // bytes

/**
 * ## POST /storage/pictures/upload
 *
 * Upload a profile picture for the authenticated user. Sends the file to `apl-storage` and updates the DB.
 *
 * ---
 *
 * ### 🔐 Requires auth
 * Uses `authGuard` to inject the `user` object.
 *
 * ---
 *
 * ### 🧠 Steps:
 * 1. Accepts a `multipart/form-data` file under field name `file`
 * 2. Forwards it to `apl-storage` at `/pictures/upload/:userId`
 * 3. Updates the user's profilePicture field in the database to the new link
 *
 * ---
 *
 * ### 🧪 Example usage with Eden (from client):
 * ```ts
 * import { eden } from '@elysiajs/eden';
 * import type { APLServer } from '~/server'; // Adjust to your actual export
 *
 * const api = eden<typeof APLServer>('https://api.autoprogresslog.com', {
 *   fetch: (input, init) => fetch(input, {
 *     ...init,
 *     headers: {
 *       ...init?.headers,
 *       Authorization: 'Bearer ' + yourAuthToken
 *     }
 *   })
 * });
 *
 * const form = new FormData();
 * form.append('file', selectedFile);
 *
 * const res = await api.storage.pictures.upload(form);
 * console.log(res.message); // "Picture uploaded successfully"
 * ```
 *
 * Note: Eden automatically serializes `FormData` in supported routes.
 */

export const uploadRoute = new Elysia({name: "upload-route"})
    .use(authGuard)
    .post(
        "/upload",
        async ({user, body, set}) => {
            const file = body.file;

            if (file.size > MAX_FILE_SIZE) {
                set.status = 413;
                return {
                    description: "File size exceeds the 6.7MB limit",
                };
            }

            const form = new FormData();
            form.append("file", file);

            const res = await fetch(
                `http://apl-storage:2727/pictures/upload/${user.id}`,
                {
                    method: "POST",
                    body: form,
                }
            );

            if (!res.ok) {
                set.status = res.status;
                return {description: "Failed to upload picture"};
            }

            await client.user.update({
                where: {id: user.id},
                data: {profilePicture: `/storage/pictures/fetch/${user.id}`},
            });

            return await res.json();
        },
        {
            body: t.Object({
                file: t.File(),
            }),
            headers: authHeaders,
            response: {
                200: t.Object({message: t.String()}),
                413: t.Object({description: t.String()}),
                400: t.Object({description: t.String()}),
                500: t.Object({description: t.String()}),
            },
        }
    );

