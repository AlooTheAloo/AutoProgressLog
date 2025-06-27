import {Elysia} from "elysia";
import swagger from "@elysiajs/swagger";
import {staticPlugin} from "@elysiajs/static";

export const app = new Elysia()
    .use(
        swagger({
            path: '/docs',
            documentation: {
                info: {
                    title: 'AutoProgressLog Static API',
                    description: 'API to serve static files for AutoProgressLog',
                    version: '1.0.0',
                }
            }
        }))
    .use(staticPlugin())
    .listen(2727, (app) => {
        console.log(
            `APL static server is running at ${app.hostname}:${app.port}`
        );
    });

export type APLStaticServer = typeof app;