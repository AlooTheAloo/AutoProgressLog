import { Elysia, t } from 'elysia';
import path from 'path';
import { existsSync, createReadStream } from 'fs';

export const fetchRoute = new Elysia({ name: 'fetch-picture' }).get(
    '/fetch/:userId',
    ({ params, set }) => {
        const { userId } = params;
        const filePath = path.resolve('./public/pictures', `${userId}.png`);

        if (!existsSync(filePath)) {
            set.status = 404;
            return { error: 'Picture not found' };
        }

        set.status = 200;
        set.headers['Content-Type'] = 'image/png';
        return createReadStream(filePath);
    },
    {
        params: t.Object({
            userId: t.String({ format: 'uuid' })
        }),
        detail: {
            tags: ['Pictures'],
            summary: 'Fetch a user picture',
            description: 'Returns the user profile picture as a PNG stream.',
            responses: {
                200: { description: 'Picture stream returned' },
                404: { description: 'Picture not found' }
            }
        }
    }
);
