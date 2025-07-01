import { Elysia } from "elysia";
import { picturesRoutes } from "./pictures";
import { rootRoute } from "./root";
import { databaseRoutes } from "./db";

export const registeredRoutes = new Elysia({ name: "registered-routes" })
  .use(picturesRoutes)
  .use(databaseRoutes)
  .use(rootRoute);
