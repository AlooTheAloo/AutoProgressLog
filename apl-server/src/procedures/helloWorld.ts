import {tRpcInstance} from "../server/trpc";

export const helloWorld = tRpcInstance.procedure.query(() => {
    return 'Hello World! The APL server is running 🔥️';
})