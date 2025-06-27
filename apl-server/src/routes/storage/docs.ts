import {Elysia} from "elysia";
import {html} from "@elysiajs/html";


export const docsRoute = new Elysia({name: 'docs-route'})
    .use(html())
    .get('/documentation', async () => {
        const res = await fetch('http://apl-storage:2727/documentation')
        if (!res.ok) {
            throw new Error('Failed to fetch documentation');
        }
        return await res.text();
    },{
        detail: {
            tags: ['Storage'],
            summary: 'Storage Documentation',
            description: 'Fetches the documentation for the storage service.',
        }
    })
