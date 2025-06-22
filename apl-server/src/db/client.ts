import {PrismaClient} from "@prisma/client";

// Singleton Prisma client instance
const prisma = new PrismaClient();

export default prisma as PrismaClient;