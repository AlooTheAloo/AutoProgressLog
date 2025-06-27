import {Elysia, t} from 'elysia';
import path from 'path';
import {unlink} from 'fs/promises';
import {existsSync} from 'fs';

export const deleteRoute = new Elysia({name: 'delete-picture'}).delete(
    '/delete/:userId',
    async ({params, set}) => {
        const {userId} = params;
        const filePath = path.resolve('./public/pictures', `${userId}.png`);

        if (!existsSync(filePath)) {
            set.status = 404;
            return {error: 'Picture not found'};
        }

        await unlink(filePath);
        return {message: 'Picture deleted successfully'};
    },
    {
        params: t.Object({
            userId: t.String({format: 'uuid'})
        }),
        response: t.Union([t.Object({
            message: t.String()
        }), t.Object({
            error: t.String()
        })]),
        detail: {
            tags: ['Pictures'],
            summary: 'Delete a user picture',
            description: 'Deletes the PNG profile picture for the specified user.',
            responses: {
                200: {description: 'Picture deleted successfully'},
                404: {description: 'Picture not found'}
            }
        }
    }
);
