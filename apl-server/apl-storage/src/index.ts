import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { registeredRoutes } from "./routes";
import { CreateIndexDB } from "./services/db";
export const app = new Elysia()
  .use(
    swagger({
      path: "/documentation",
      documentation: {
        info: {
          title: "AutoProgressLog Static API",
          description: "API to serve static files for AutoProgressLog",
          version: "1.0.0",
        },
        tags: [
          {
            name: "Database",
            description: "Interact with the user database",
          },
          {
            name: "Pictures",
            description: "Upload and manage user pictures",
          },
        ],
      },
    })
  )
  .use(
    staticPlugin({
      assets: "./public",
      prefix: "/public",
    })
  )
  .use(registeredRoutes)
  .listen(2727, (app) => {
    CreateIndexDB();
    console.log(`APL static server is running at ${app.hostname}:${app.port}`);
  });

export type APLStaticServer = typeof app;
