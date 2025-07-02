import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { initTogglNotifications, togglWebhook } from "./webhooks/toggl";
import { SocketManager } from "./sockets/manager";
import { registeredRoutes } from "./routes";
import { executeFetch } from "./services/storage/anki";
import AnkiStorage from "./services/anki/AnkiStorage";

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
          {
            name: "User",
            description: "User-related endpoints",
          },
          {
            name: "Storage",
            description: "Endpoints to interact with the storage service",
          },
        ],
      },
    })
  )
  .use(registeredRoutes)
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
  .listen(3000, async (app) => {
    console.log(`APL Server is running on http://${app.hostname}:${app.port}/`);
    AnkiStorage.init(Bun.env.STORAGE_URL ?? "");
  });

// TODO : Move this somewhere else
initTogglNotifications();

export type APLServer = typeof app;
