import {Elysia} from "elysia";
import {configRoutes} from "./config";

export const userRoutes = new Elysia({name: 'user-routes'}).group('/user', app =>
    app.use(configRoutes)
);