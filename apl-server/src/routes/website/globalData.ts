import Elysia, { t } from "elysia";
import prisma from "../../db/client";
import dayjs from "dayjs";

type GlobalDataCache = {
    object : GlobalData,
    lastUpdated : Date
}

type GlobalData = {
    userCountApprox : number,
    totalHours : number,
    totalReviews : number,
    reports : number
}

let globalDataCache : GlobalDataCache | null = null;

const CACHE_TTL = 60 * 60 * 12; // 12 hours

export const globalDataRoute = new Elysia({ name: "global-data-routes" })
    .get("globalData", async () => {

        if(globalDataCache != null){
            if(dayjs(globalDataCache.lastUpdated).diff(dayjs(), "seconds") < CACHE_TTL){
                console.log("USED CACHE for global data :3")
                return globalDataCache.object;
            }
        }

        console.log("UPDATING CACHE for global data :3")
        const userCount = await prisma.user.count();
        const pow = Math.pow(10, userCount.toString().length - 1)
        const userCountApprox = Math.floor(userCount / pow) * pow;

        const totalHours = Math.floor(((await prisma.immersionActivity.aggregate({
            _sum: {
                seconds: true
            }
        }))._sum.seconds ?? 0) / 3600);


        const latestSyncPerUser = await prisma.syncData.groupBy({
            by: ["userId"],
            _max: {
                generationTime: true,
            },
        });

        const latestSyncRows = await prisma.syncData.findMany({
            where: {
                OR: latestSyncPerUser.map(x => ({
                    userId: x.userId,
                    generationTime: x._max.generationTime!,
                })),
                AND: {
                    ankiData: {
                        isNot: null
                    }
                }
            }
            ,
            select: {
                ankiData:{
                    select: {
                        totalCardsStudied: true   
                    }
                }
            }
        });

        const totalReviews = latestSyncRows.reduce((acc, x) => acc + (x.ankiData?.totalCardsStudied ?? 0), 0);
        

        const reports = await prisma.report.count();
        
        globalDataCache = {
            object : {
                userCountApprox: userCountApprox,
                totalHours: totalHours,
                totalReviews: totalReviews,
                reports: reports
            },
            lastUpdated: new Date()
        }

        return globalDataCache.object;
    },
    {
        detail: {
            tags: ["Website"],
            summary: "Get global user data about the application",
            description: "Return approximate user count, total amount of hours tracked by all users, total reviews tracked and total created reports.",
        },
        response:  t.Object({
            userCountApprox : t.Integer(),
            totalHours : t.Number(),
            totalReviews : t.Integer(),
            reports : t.Integer(),
        }),

    }
);