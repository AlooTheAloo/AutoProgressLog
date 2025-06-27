import {Elysia} from "elysia";
import {picturesRoutes} from "./pictures";
import {rootRoute} from "./root";


export const registeredRoutes = new Elysia({name: 'registered-routes'})
    .use(picturesRoutes)
    .use(rootRoute)