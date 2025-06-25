import {loginRoute} from "./login";
import {validateRoute} from "./validate";
import {Elysia} from "elysia";
import {RateLimiterFactory} from "../../middlewares/rateLimiter";
import {logoutRoutes} from "./logout";

export const authRoutes = new Elysia({name: 'auth-routes'}).group('/auth', app =>
    app
        .use(loginRoute.use(RateLimiterFactory.for("login")))
        .use(validateRoute.use(RateLimiterFactory.for("validate")))
        .use(logoutRoutes)
);