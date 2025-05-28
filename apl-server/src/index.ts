import {Elysia} from "elysia";
import cors from "@elysiajs/cors";
import {appRouter} from "./server/router";
import {trpc} from "@elysiajs/trpc";

const app = new Elysia()
    .use(
        cors({
            origin: ["http://localhost:*", "https://www.aplapp.dev"],
        })
    )
    .use(trpc({router: appRouter, endpoint: '/api/trpc'}))

app.listen(3000);

console.log("️‍🔥️ Server is running at http://localhost:3000/");
