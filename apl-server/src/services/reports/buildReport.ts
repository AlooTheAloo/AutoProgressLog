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

    // Get Previous SyncData with not null ankiData
    const previousSync = await client.syncData.findFirst({
        where: {
            userId: userId,
            ankiData: {
                isNot: null,
            }
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
            ankiData: {
                isNot: null,
            },
            report: {
                isNot: null,
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
    if (!previousSync) {
        console.log("No previous sync with report found for user " + userId);
    }
    // Generate the new report
    const totalImmersion = await client.immersionActivity.aggregate({
        where: {userId},
        _sum: {seconds: true},
    });
    await client.syncData.create({
        data: {
            userId,
            totalImmersionTime: totalImmersion._sum.seconds ?? 0,
            ankiData:
                ankiToken || url
                    ? {
                        create: {
                            totalCardsStudied: await AnkiStorage.getAnkiCardReviewCount(
                                userId
                            ).then((r) => r.totalCount ?? 0),
                            cardsStudied: await AnkiStorage.getAnkiCardReviewCount(
                                userId
                            ).then((r) =>
                                Math.abs(
                                    (r.totalCount ?? 0) -
                                    (previousSync?.ankiData?.totalCardsStudied ?? 0)
                                )
                            ),
                            mature: (await AnkiStorage.getMatureCards(userId)) ?? 0,
                            retention: (await AnkiStorage.getRetention(userId)) ?? 0,
                        },
                    }
                    : undefined,
            report: {
                create: {
                    reportNo: (await client.report.count() ?? 0) + 1,
                    userId: userId,
                    score: 0,
                    streak: {
                        create: {
                            immersionStreak: ((previousSyncReport?.totalImmersionTime ?? 0) < (totalImmersion._sum.seconds ?? 0))
                                ? (previousSyncReport?.report?.streak?.immersionStreak ?? 0) + 1
                                : 0,

                            ankiStreak: (previousSyncReport?.ankiData?.totalCardsStudied ?? 0 <
                                (await AnkiStorage.getAnkiCardReviewCount(userId)).totalCount)
                                ? (previousSyncReport?.report?.streak?.ankiStreak ?? 0) + 1
                                : 0,
                        }
                    }
                }
            }
        },
        include: {ankiData: true},
    });
}
