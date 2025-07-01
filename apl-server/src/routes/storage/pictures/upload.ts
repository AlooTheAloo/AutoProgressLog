import { Elysia, t } from "elysia";
import { authGuard, authHeaders } from "../../../middlewares/authGuard";
import client from "../../../db/client";

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

export const uploadRoute = new Elysia({ name: 'upload-route' })
    .use(authGuard)
    .post('/upload',
        async ({ user, body, set }) => {
            const form = new FormData();
            form.append('file', body.file);

            const res = await fetch(`http://apl-storage:2727/pictures/upload/${user.id}`, {
                method: 'POST',
                body: form,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!res.ok) {
                set.status = res.status;
                return { error: 'Failed to upload picture' };
            }

            // Update the user's profilePicture field in the DB
            client.user.update({
                where: { id: user.id },
                data: { profilePicture: `/storage/pictures/fetch/${user.id}` },
            }).catch(err => {
                console.error('Failed to update user picture URL:', err);
            });

            return res.json();
        },
        {
            body: t.Object({
                file: t.File(),
            }),
            headers: authHeaders,
            response: {
                200: t.Object({
                    description: t.String(), // You could rename to 'message' if more accurate
                }),
                400: t.Object({
                    description: t.String(),
                }),
                500: t.Object({
                    description: t.String(),
                }),
            },
            detail: {
                tags: ['Storage'],
                summary: 'Upload a picture',
                description: 'Uploads a picture to the storage service and updates the user\'s profile picture URL in the database.',
            },
        }
    );
