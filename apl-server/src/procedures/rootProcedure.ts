import { tRpcInstance } from "../server/trpc";
import {PrismaClient} from "@prisma/client";
import { compile } from "@elysiajs/trpc";
import { t as T } from "elysia";

const prisma = new PrismaClient();

export const rootProcedure = tRpcInstance.procedure
    .output(
        compile(
            T.Nullable(
                T.Object({
                    id: T.Integer(),
                    createdAt: T.String(),
                    email: T.String(),
                    name: T.String(),
                })
            )
        )
    )
    .query(async () => await prisma.user.findFirst());
