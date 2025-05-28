import {tRpcInstance} from "../server/trpc";

export const helloWorld = tRpcInstance.procedure.query(() => 'Hello World! The APL server is running 🔥️');