import {authRoutes} from "./auth";
import {downloadLinksRoute} from "./downloadLinks";
import {rootRoute} from "./root";
import {Elysia} from "elysia";
import {userRoutes} from "./user";
import {storageRoutes} from "./storage";

export const registeredRoutes = new Elysia({name: 'registered-routes'})
    .use(authRoutes)
    .use(userRoutes)
    .use(storageRoutes)
    .use(downloadLinksRoute)
    .use(rootRoute);