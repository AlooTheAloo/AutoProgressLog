import { Elysia, t } from "elysia";

/**
 * ## GET /storage/pictures/fetch/:userId
 *
 * This route fetches a user's profile picture by proxying a request to the internal storage service.
 *
 * ---
 *
 * ### 🔓 Public Access
 * No authentication is required so it can be used in image tags.
 *
 * ---
 *
 * ### 🧠 Steps:
 * 1. Forward the request to `apl-storage`.
 * 2. Stream the file back to the client.
 *
 * ---
 *
 * ### 🧪 Example usage with Eden (in client):
 * ```ts
 * import { eden } from '@elysiajs/eden';
 * import type { APLServer } from '~/server'; // or wherever the app is defined
 *
 * const api = eden<typeof APLServer>('https://api.autoprogresslog.com');
 *
 * const pictureUrl = `/storage/pictures/fetch/${user.id}`;
 * const res = await fetch(api.baseUrl + pictureUrl);
 *
 * const blob = await res.blob();
 * const imageURL = URL.createObjectURL(blob);
 * ```
 */

export const fetchRoute = new Elysia({ name: 'fetch-route' }).get(
    'fetch/:userId',
    async ({ params, set }) => {
        const { userId } = params;

        const res = await fetch(`http://apl-storage:2727/pictures/fetch/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            set.status = res.status;
            return { error: 'Failed to fetch picture' };
        }

        set.headers['Content-Type'] = res.headers.get('Content-Type') || 'image/*';
        return new Response(await res.arrayBuffer());
    },
    {
        params: t.Object({
            userId: t.String({ format: "uuid" }),
        }),
        detail: {
            tags: ['Storage'],
            summary: 'Fetch a picture',
            description: 'Fetches a user\'s profile picture from the internal storage server.',
        },
        responses: {
            200: { description: 'Returns image/png content' },
            404: { description: 'Profile picture not found' },
        },
    }
);
