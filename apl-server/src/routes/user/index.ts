import {Elysia} from "elysia";
import {configRoutes} from "./config";
import {verifyProviderRoutes} from "./verifyProvider";

export const userRoutes = new Elysia({name: 'user-routes'}).group('/user', app =>
    app.use(configRoutes)
        .use(verifyProviderRoutes)
);