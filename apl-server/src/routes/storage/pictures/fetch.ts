import {Elysia, t} from "elysia";

export const fetchRoute = new Elysia({name: 'fetch-route'})
    .get('fetch/:userId', async ({params, set}) => {
            const {userId} = params;

            const res = await fetch(`http://apl-storage:2727/pictures/fetch/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                set.status = res.status;
                return {error: 'Failed to fetch picture'};
            }

            set.headers['Content-Type'] = res.headers.get('Content-Type') || 'image/*';

            return new Response(await res.arrayBuffer())
        },
        {
            params: t.Object({
                userId: t.String({format: "uuid"})
            }),
            detail: {
                tags: ['Storage'],
                summary: 'Fetch a picture',
                description: 'Fetches a user\'s profile picture from the storage service.'
            },
            responses: {
                200: {description: 'Returns image/png content'},
                404: {description: 'Profile picture not found'},
            }
        })