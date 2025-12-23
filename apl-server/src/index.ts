import { Elysia, ValidationError } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { initTogglNotifications, togglWebhook } from "./webhooks/toggl";
import { SocketManager } from "./sockets/manager";
import { registeredRoutes } from "./routes";
import AnkiStorage from "./services/anki/AnkiStorage";
import { init as zstdinit } from "@bokuweb/zstd-wasm";
import { startTunnel } from "./services/ngrok/dev-tunnel";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

const sm = new SocketManager();
export const app = new Elysia()
  .onStart(async () => {
    AnkiStorage.init(Bun.env.STORAGE_URL ?? "");
    initTogglNotifications();
    await zstdinit();
    await startTunnel();
  })
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
  .onError(({ code, error }) => {
    if (code === "VALIDATION") {
      console.log("validation error", error.validator.Errors(error.value));
      return error.validator.Errors(error.value).First().message;
    }
  })
  .listen(3000, (app) => {
    console.log(`APL Server is running on http://${app.hostname}:${app.port}/`);
  });

export type APLServer = typeof app;
