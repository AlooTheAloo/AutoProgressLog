import {authRoutes} from "./auth";
import {downloadLinksRoute} from "./downloadLinks";
import {rootRoute} from "./root";
import {Elysia} from "elysia";
import {userRoutes} from "./user";

export const registeredRoutes = new Elysia({name: 'registered-routes'})
    .use(authRoutes)
    .use(userRoutes)
    .use(downloadLinksRoute)
    .use(rootRoute);