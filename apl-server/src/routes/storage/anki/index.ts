import Elysia from "elysia";
import { matureRoute } from "./mature";
import { allRoute } from "./all";
import { retentionRoute } from "./retention";
import { reviewsRoute } from "./reviews";

export const ankiRoutes = new Elysia({ name: "anki-routes" }).group(
  "/anki",
  (app) =>
    app.use(allRoute).use(matureRoute).use(retentionRoute).use(reviewsRoute)
);
