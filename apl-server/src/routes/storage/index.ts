import { Elysia } from "elysia";
import { picturesRoutes } from "./pictures";
import { ankiRoutes } from "./anki";

export const storageRoutes = new Elysia({ name: "storage-routes" }).group(
  "/storage",
  (app) => app.use(picturesRoutes).use(ankiRoutes)
);
