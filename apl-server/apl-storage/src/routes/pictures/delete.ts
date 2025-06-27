import {Elysia, t} from 'elysia';
import path from 'path';
import {unlink} from 'fs/promises';
import {existsSync} from 'fs';

/**
 * @module deleteRoute (apl-storage)
 *
 * ## 🗑 Delete Picture Endpoint
 *
 * This route handles deletion of a user’s profile picture from the file system.
 * It assumes each user’s picture is stored under:
 *
 * 📁 `./public/pictures/{userId}.png`
 *
 * ---
 *
 * ### 🧠 Responsibility
 * - This route is used internally by `apl-server`, typically as a reverse proxy call.
 * - It directly interacts with the filesystem — no database logic here.
 *
 * ---
 *
 * ### 📥 Expected input
 * - `userId` as a path parameter (UUID format)
 *
 * ---
 *
 * ### 🔄 Behavior
 * - Checks if the file exists
 * - If not found, returns 404
 * - If found, deletes the file
 */
export const deleteRoute = new Elysia({name: 'delete-picture'}).delete(
    '/delete/:userId',
    async ({params, set}) => {
        const {userId} = params;

        // Construct absolute path to the user's picture
        const filePath = path.resolve('./public/pictures', `${userId}.png`);

        // If the file does not exist, return 404
        if (!existsSync(filePath)) {
            set.status = 404;
            return {error: 'Picture not found'};
        }

        // Delete the file from the filesystem
        await unlink(filePath);

        return {message: 'Picture deleted successfully'};
    },
    {
        params: t.Object({
            userId: t.String({format: 'uuid'}),
        }),
        response: t.Union([
            t.Object({
                message: t.String(),
            }),
            t.Object({
                error: t.String(),
            }),
        ]),
        detail: {
            tags: ['Pictures'],
            summary: 'Delete a user picture',
            description: `Deletes a user’s profile picture (PNG) from the storage server.
This does **not** require auth in apl-storage but should be reverse-proxied by apl-server for access control.`,
            responses: {
                200: {description: 'Picture deleted successfully'},
                404: {description: 'Picture not found'},
            },
        },
    }
);
