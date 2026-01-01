import client from "../../db/client";
import AnkiStorage from "../anki/AnkiStorage";
import NormalSyncer from "../anki/NormalSyncer";
import AnkiHTTPClient from "../anki/AnkiHTTPClient";
import { syncTogglData } from "../toggl/syncService";

const MATURE_WEIGHT = 100;
const CARD_WEIGHT = 1;
const SECOND_WEIGHT = 1;

export async function buildReport(userId: number, skipSync: boolean = false) {
    if (!skipSync) {
        await syncTogglData(userId, true);
    }
    
    // Check for recent report generation (Concurrency/Debounce)
    const lastRecentReport = await client.report.findFirst({
        where: { userId: userId },
        orderBy: { reportNo: 'desc' },
        include: { syncData: true }
    });

    if (lastRecentReport && lastRecentReport.syncData && 
        (new Date().getTime() - lastRecentReport.syncData.generationTime.getTime() < 10000)) {
        console.log("Report generated too recently, skipping build for user:", userId);
        throw new Error("RATE_LIMIT"); 
    }

    const {ankiToken, url} =
    (await client.userConfig
        .findUnique({where: {userId}})
        .ankiConfig({select: {ankiToken: true, url: true}})) ?? {};

    if (ankiToken || url) {
        try {
            console.log("Anki config found, initializing NormalSyncer...");
            await new NormalSyncer(
                new AnkiHTTPClient(ankiToken, url),
                userId
            ).start();
            console.log("NormalSyncer finished successfully for user:", userId);
        } catch (error) {
            console.error("NormalSyncer failed for user:", userId, error);
        }
    } else {
        console.log(
            "No Anki config found, skipping NormalSyncer for user:",
            userId
        );
    }

    // Get Previous SyncData
    const previousSync = await client.syncData.findFirst({
        where: {
            userId: userId,
        },
        orderBy: {
            generationTime: 'desc',
        },
        include: {
            ankiData: true,
        }
    });

    const previousSyncReport = await client.syncData.findFirst({
        where: {
            userId: userId,
            report: {
                isNot: null
            }   
        },
        orderBy: {
            generationTime: 'desc',
        },
        include: {
            ankiData: true,
            report: {include: {streak: true, metadata: true}},
        }
    });


    // Get 10 last reports
    const previousReports = await client.report.findMany({
        where: {
            userId: userId,
            reportNo: {
                gte: (previousSyncReport?.report?.reportNo ?? 0) - 10,
            }
        },
        orderBy: {
            reportNo: "asc",
        },
        include: {
            syncData: true,
            score: true,
        }
    });


    let times = previousReports.map((x) => x.score?.immersionScore ?? 0);

    if (!previousSync) {
        console.log("No previous sync with report found for user " + userId);
    }
    // Get current total immersion for snapshot (still useful for total time display)
    const totalImmersion = await client.immersionActivity.aggregate({
        where: {userId},
        _sum: {seconds: true},
    });

    // Calculate delta from logs created since the last report
    const lastReportTime = previousSyncReport?.generationTime ?? new Date(0);
    const immersionLogsSinceLastReport = await client.immersionActivity.findMany({
        where: {
            userId: userId,
            updatedAt: {
                gt: lastReportTime,
            }
        }
    });

    const secondsDelta = (totalImmersion._sum.seconds ?? 0) - (previousSyncReport?.totalImmersionTime ?? 0);
    
    // Group logs for persistent storage
    const immersionLogMap = new Map<string, number>();
    immersionLogsSinceLastReport.forEach((log) => {
        const current = immersionLogMap.get(log.activityName) || 0;
        immersionLogMap.set(log.activityName, current + log.seconds);
    });

    const immersionLogData = Array.from(immersionLogMap.entries()).map(([name, seconds]) => ({
        activityName: name,
        seconds: seconds,
    }));

    times.push(secondsDelta);
    times = times.reverse();

    const averageImmersionTime = arithmeticWeightedMean(times as number[]);

    let revCount:{
        count: {
            did: number;
            count: number;
        }[];
        totalCount: number;
    } | null = null;
    let matureCount:number|null = null;
    let retention:number|null = null;

    const immersionScore = (Math.max(secondsDelta, 0)) * SECOND_WEIGHT;
    let ankiScore = 0;
    
    if(ankiToken != undefined || url != undefined){
        try {
            revCount = await AnkiStorage.getAnkiCardReviewCount(userId);
            matureCount = await AnkiStorage.getMatureCards(userId);
            retention = await AnkiStorage.getRetention(userId) ?? null;
            if(!previousSyncReport?.report?.metadata?.hasAnki){
                ankiScore = 0;
            }
            else {
                const cardScore = Math.max(revCount?.totalCount - (previousSyncReport.ankiData?.totalCardsStudied ?? 0), 0) 
                const matureScore = Math.max((matureCount ?? 0) - (previousSyncReport.ankiData?.mature ?? 0), 0)
                ankiScore = cardScore * CARD_WEIGHT + matureScore * MATURE_WEIGHT;
            }
        } catch (error) {
            console.error("Failed to fetch Anki data for scoring:", error);
            ankiScore = 0;
        }
    }


    let totalScore = immersionScore + ankiScore;

    await client.syncData.create({
        data: {
            userId,
            totalImmersionTime: totalImmersion._sum.seconds ?? 0,
            ankiData:
                (ankiToken != undefined || url != undefined)
                    ? {
                        create: {
                            totalCardsStudied: revCount?.totalCount ?? 0,
                            cardsStudied: Math.max(
                                (revCount?.totalCount ?? 0) -
                                    (previousSync?.ankiData?.totalCardsStudied ?? 0)
                                , 0)
                            ,
                            mature: matureCount ?? 0,
                            retention: retention ?? 0,
                        },
                    }
                    : undefined,
            report: {
                create: {
                    reportNo: (previousSyncReport?.report?.reportNo ?? 0) + 1,
                    userId: userId,
                    score: {
                        create: {
                            immersionScore: immersionScore,
                            ankiScore: ankiScore,
                            totalScore: totalScore,
                        }
                    },
                    immersionLog: {
                        createMany: {
                            data: immersionLogData
                        }
                    },
                    streak: {
                        create: {
                            immersionStreak: (secondsDelta > 0)
                                ? (previousSyncReport?.report?.streak?.immersionStreak ?? 0) + 1
                                : 0,

                            ankiStreak: (ankiToken != undefined || url != undefined) ? (((previousSyncReport?.ankiData?.totalCardsStudied ?? 0) <
                                (revCount?.totalCount ?? 0))
                                ? (previousSyncReport?.report?.streak?.ankiStreak ?? 0) + 1
                                : 0) : 0,
                        }
                    },
                    metadata:  {
                        create: {
                            hasAnki: (ankiToken != null || url != null),
                        }
                    },
                    averageImmersionTime: averageImmersionTime,
                    bestImmersionTime: Math.max(
                        secondsDelta,
                        (previousSyncReport?.report?.bestImmersionTime ?? 0)
                    ),
                }
            }
        },
        include: {ankiData: true},
    });

}


export function arithmeticWeightedMean(array: number[]): number {
  if (array.length === 0) return 0;

  const n = array.length;
  const s = (n * (n + 1)) / 2;
  return (
    array.reduce((a, b, i) => {
      return a + b * (n - i);
    }, 0) / s
  );
}
