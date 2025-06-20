import {authRoutes} from "./auth";
import {downloadLinksRoute} from "./downloadLinks";
import {rootRoute} from "./root";
import {Elysia} from "elysia";

export const registeredRoutes = (app: Elysia) =>
    app
        .use(authRoutes)
        .use(downloadLinksRoute)
        .use(rootRoute);