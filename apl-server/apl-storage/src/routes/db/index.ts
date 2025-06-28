import Elysia from "elysia";
import { queryRoute } from "./query";
import { uploadRoute } from "./upload";
import { deleteRoute } from "./delete";
import { modifyRoute } from "./modify";

export const databaseRoutes = new Elysia({ name: "anki-database-route" }).group(
  "/ankidb",
  (app) =>
    app.use(queryRoute).use(modifyRoute).use(uploadRoute).use(deleteRoute)
);
