import {tRpcInstance} from "./trpc";
import {helloWorld} from "../procedures/helloWorld";
import {downloadLinks} from "../procedures/downloadLinks";

export const appRouter = tRpcInstance.router({
    helloWorld,
    downloadLinks,
});

export type AppRouter = typeof appRouter;
