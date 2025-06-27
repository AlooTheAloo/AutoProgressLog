import {Elysia} from "elysia";
import {picturesRoutes} from "./pictures";


export const storageRoutes = new Elysia({name: 'storage-routes'}).group('/storage', app =>
    app
        .use(picturesRoutes)
        // Add Anki DB routes here in the future
)