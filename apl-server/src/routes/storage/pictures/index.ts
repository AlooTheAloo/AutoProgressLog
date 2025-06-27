import Elysia from "elysia";
import {uploadRoute} from "./upload";
import {fetchRoute} from "./fetch";
import {deleteRoute} from "./delete";


export const picturesRoutes = new Elysia({name: 'picture-routes'}).group('/pictures', (app) =>
    app
        .use(uploadRoute)
        .use(fetchRoute)
        .use(deleteRoute)
)