import {Elysia} from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import {downloadLinksRoute} from "./procedures/downloadLinks";
import {initTogglNotifications, togglWebhook} from "./webhooks/toggl";
import {rootRoute} from "./procedures/root";
import {SocketManager} from "./socket/socketManager";
import {loginRoute} from "./procedures/user/auth/login";
import {validateRoute} from "./procedures/user/auth/validate";
import {RateLimiterFactory} from "./plugins/RateLimiterFactory";

const sm = new SocketManager();
export const app = new Elysia()
    .use(
        cors({
            origin: ["http://localhost:*", "https://www.aplapp.dev"],
        })
    )
    .use(
        swagger({
            path: "/docs",
            documentation: {
                info: {
                    title: "AutoProgressLog API",
                    description: "API for AutoProgressLog",
                    version: "1.0.0",
                },
                tags: [
                    {
                        name: "Download Links",
                        description: "Endpoints related to download links",
                    },
                    {
                        name: "Info",
                        description: "General information endpoints",
                    },
                    {
                        name: "Webhooks",
                        description: "Webhook endpoints for external integrations",
                    },
                    {
                        name: "Auth",
                        description: "Authentication endpoints",
                    },
                ],
            },
        })
    )
    .use(rootRoute)
    .use(downloadLinksRoute)
    .use(loginRoute.use(RateLimiterFactory.for("login")))
    .use(validateRoute.use(RateLimiterFactory.for("validate")))
    .use(togglWebhook)
    .ws("/ws", {
        open(ws) {
            sm.open(ws);
        },
        message(ws, message) {
            sm.message(ws, message);
        },
        close(ws) {
            sm.close(ws);
        },
    })
    .listen(3000, (app) => {
        console.log(`APL Server is running on http://${app.hostname}:${app.port}/`);
    });

// TODO : Move this somewhere else
initTogglNotifications();

export type APLServer = typeof app;
