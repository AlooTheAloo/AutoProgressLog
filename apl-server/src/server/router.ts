import {tRpcInstance} from "./trpc";
import {rootProcedure} from "../procedures/rootProcedure";
import {downloadLinks} from "../procedures/downloadLinks";

export const appRouter = tRpcInstance.router({
    rootProcedure,
    downloadLinks,
});

export type AppRouter = typeof appRouter;
