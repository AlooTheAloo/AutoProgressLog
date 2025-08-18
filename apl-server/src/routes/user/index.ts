import {Elysia} from "elysia";
import {configRoutes} from "./config";
import {verifyProviderRoutes} from "./verifyProvider";
import {syncRoute} from "./sync";
import {meRoutes} from "./me";

export const userRoutes = new Elysia({name: 'user-routes'}).group('/user', app =>
    app.use(configRoutes)
        .use(syncRoute)
        .use(meRoutes)
        .use(verifyProviderRoutes)
);