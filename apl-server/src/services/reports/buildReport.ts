import client from "../../db/client";
import AnkiStorage from "../anki/AnkiStorage";
import NormalSyncer from "../anki/NormalSyncer";
import AnkiHTTPClient from "../anki/AnkiHTTPClient";

export async function buildReport(userId: number) {
    const {ankiToken, url} =
    (await client.userConfig
        .findUnique({where: {userId}})
        .ankiConfig({select: {ankiToken: true, url: true}})) ?? {};

    if (ankiToken || url) {
        console.log("Anki config found, initializing NormalSyncer...");
        await new NormalSyncer(
            new AnkiHTTPClient(ankiToken, url),
            userId
        ).start();
        console.log("NormalSyncer finished successfully for user:", userId);
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
            report: {include: {streak: true}},
        }
    });

    console.log("Pregvious sync reports " + JSON.stringify(previousSyncReport));

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
            syncData: true
        }
    });

    console.log(previousReports);   

    let times = previousReports.map((x, i) => {
        if(i == 0) return null;
        return x.syncData.totalImmersionTime - previousReports[i - 1]?.syncData.totalImmersionTime;
    });




    if (!previousSync) {
        console.log("No previous sync with report found for user " + userId);
    }
    // Generate the new report
    const totalImmersion = await client.immersionActivity.aggregate({
        where: {userId},
        _sum: {seconds: true},
    });



    times = times.slice(1).reverse();

    console.log(times);
    const averageImmersionTime = arithmeticWeightedMean(times as number[]);

    const revCount = await AnkiStorage.getAnkiCardReviewCount(userId);

    await client.syncData.create({
        data: {
            userId,
            totalImmersionTime: totalImmersion._sum.seconds ?? 0,
            ankiData:
                (ankiToken != undefined || url != undefined)
                    ? {
                        create: {
                            totalCardsStudied: revCount.totalCount ?? 0,
                            cardsStudied: Math.abs(
                                (revCount.totalCount ?? 0) -
                                    (previousSync?.ankiData?.totalCardsStudied ?? 0)
                                )
                            ,
                            mature: (await AnkiStorage.getMatureCards(userId)) ?? 0,
                            retention: (await AnkiStorage.getRetention(userId)) ?? 0,
                        },
                    }
                    : undefined,
            report: {
                create: {
                    reportNo: (await client.report.count() ?? 0),
                    userId: userId,
                    score: 0,
                    streak: {
                        create: {
                            immersionStreak: ((totalImmersion._sum.seconds ?? 0) > (previousSyncReport?.totalImmersionTime ?? 0))
                                ? (previousSyncReport?.report?.streak?.immersionStreak ?? 0) + 1
                                : 0,

                            ankiStreak: (ankiToken != undefined || url != undefined) ? (((previousSyncReport?.ankiData?.totalCardsStudied ?? 0) <
                                (revCount.totalCount ?? 0))
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
                        (totalImmersion._sum.seconds ?? 0) - (previousReports.at(-1)?.syncData.totalImmersionTime ?? 0),
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
