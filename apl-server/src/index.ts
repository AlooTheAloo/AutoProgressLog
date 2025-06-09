import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { downloadLinksRoute } from "./procedures/downloadLinks";
import { togglWebhook } from "./Routes/WebHooks/toggl";
import { rootRoute } from "./procedures/rootProcedure";
import { SocketManager } from "./socket/socketManager";

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
        ],
      },
    })
  )
  .use(rootRoute)
  .use(downloadLinksRoute)
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
  .listen(3000, () => {
    console.log("APL Server is running on http://localhost:3000/");
  });

export type APLServer = typeof app;
