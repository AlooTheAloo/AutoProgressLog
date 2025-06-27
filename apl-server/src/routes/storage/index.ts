import {Elysia} from "elysia";
import {docsRoute} from './docs'
import {picturesRoutes} from "./pictures";


export const storageRoutes = new Elysia({name: 'storage-routes'}).group('/storage', app =>
    app
        .use(docsRoute)
        .use(picturesRoutes)
)