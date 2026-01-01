import Elysia from "elysia";
import { downloadLinksRoute } from "./downloadLinks";
import { globalDataRoute } from "./globalData";

export const websiteRoutes = new Elysia({ name: "website-routes" }).group(
  "/web",
  (app) =>
    app
      .use(downloadLinksRoute)
      .use(globalDataRoute)
);
