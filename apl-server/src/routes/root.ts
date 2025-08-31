import { Elysia, t } from 'elysia';

export const rootRoute = new Elysia({ name: 'root' }).get(
    '/',
    () => 'Welcome to the APL server!',
    {
        response: t.String({
            example: 'Welcome to the APL server!',
        }),
        detail: {
            summary: 'Root route',
            tags: ['Info'],
            description: 'Returns a welcome message for the AutoProgressLog server.',
        },
    }
);
