import { authRoutes } from "./auth";
import { downloadLinksRoute } from "./website/downloadLinks";
import { rootRoute } from "./root";
import { Elysia } from "elysia";
import { userRoutes } from "./user";
import { storageRoutes } from "./storage";
import { verifyProviderRoutes } from "./user/verifyProvider";
import { surveyRoutes } from "./survey";
import { websiteRoutes } from "./website";

export const registeredRoutes = new Elysia({ name: "registered-routes" })
  .use(authRoutes)
  .use(userRoutes)
  .use(storageRoutes)
  .use(rootRoute)
  .use(surveyRoutes)
  .use(websiteRoutes);