import {Elysia, t, Static} from "elysia";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import client from "../../db/client";
import AnkiStorage from "../../services/anki/AnkiStorage";
import NormalSyncer from "../../services/anki/NormalSyncer";
import AnkiHTTPClient from "../../services/anki/AnkiHTTPClient";
import dayjs from "dayjs";

// -- SCHEMAS --
const ImmersionDTOSchema = t.Object({
    totalImmersion: t.Number(),
    immersionSinceLastReport: t.Number(),
    monthlyImmersion: t.Number(),
    monthlyImmersionLastMonth: t.Number(),
    immersionSources: t.Array(
        t.Object({name: t.String(), relativeValue: t.Number()})
    ),
    immersionStreak: t.Array(t.Number()),
});

const AnkiDTOSchema = t.Object({
    retentionRate: t.Number(),
    retentionRateDelta: t.Number(),
    totalReviews: t.Number(),
    reviewsDelta: t.Number(),
});

const DashboardDTOSchema = t.Object({
    userName: t.String(),
    profile_picture: t.String(),
    lastSyncTime: t.String(),
    lastReportTime: t.String(),
    immersionDTO: ImmersionDTOSchema,
    ankiDTO: t.Optional(AnkiDTOSchema),
    nextReport: t.Union([t.Number(), t.Null()]),
});

/**
 * ## POST /sync
 *
 * Synchronizes and returns up-to-date dashboard metrics for the authenticated user.
 *
 * ---
 *
 * ### 🧠 What it does:
 * - Computes immersion time (total, monthly, since last report, by source, streak)
 * - Optionally fetches and persists Anki stats if Anki config is present
 * - Computes differences vs. last report (delta)
 * - Computes the next report generation time (based on user config)
 *
 * ---
 *
 * ### 🧪 Example usage (Eden):
 * ```ts
 * const dashboard = await api.sync.post();
 * console.log(dashboard.immersionDTO.totalImmersion);
 * ```
 */
export const syncRoute = new Elysia({name: "sync-route"}).use(authGuard).post(
    "/sync",
    async ({user, set}) => {
        const userId = user.id;

        console.log("=== SYNC START for user:", userId, "===");

        console.log("Step 1: Getting config data for user:", userId);
        const {ankiToken, url} =
        (await client.userConfig
            .findUnique({where: {userId}})
            .ankiConfig({select: {ankiToken: true, url: true}})) ?? {};

        console.log(
            "User config retrieved:",
            JSON.stringify({ankiToken: !!ankiToken, url}, null, 2)
        );

        console.log("Step 2: Running NormalSyncer().start() for user:", userId);
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

        console.log("Step 3: Aggregating immersion data for user:", userId);
        console.log("Aggregating immersion data for user:", userId);
        const totalImmersion = await client.immersionActivity.aggregate({
            where: {userId},
            _sum: {seconds: true},
        });
        console.log(
            "Total immersion time for user:",
            userId,
            totalImmersion._sum.seconds
        );

        console.log("Step 4: Fetching latest sync data for user:", userId);
        const latestSync = await client.syncData.findFirst({
            orderBy: {generationTime: "desc"},
            where: {userId, ankiData: {isNot: null}},
            include: {ankiData: true},
        });
        console.log("Latest sync retrieved:", latestSync?.id ?? "None");

        console.log("Step 5: Creating new sync data for user:", userId);
        const createdSync = await client.syncData.create({
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
                                        (latestSync?.ankiData?.totalCardsStudied ?? 0)
                                    )
                                ),
                                mature: (await AnkiStorage.getMatureCards(userId)) ?? 0,
                                retention: (await AnkiStorage.getRetention(userId)) ?? 0,
                            },
                        }
                        : undefined,
            },
            include: {ankiData: true},
        });
        console.log("New sync data created:", createdSync.id, createdSync);

        console.log("Step 6: Fetching latest report for user:", userId);
        const latestReport = await client.syncData.findFirst({
            orderBy: {generationTime: "desc"},
            where: {userId, report: {isNot: null}},
            include: {ankiData: true},
        });
        console.log("Latest report retrieved:", latestReport?.id ?? "None");

        console.log("Step 7: Computing immersion metrics for user:", userId);
        const immersionSinceLastReport =
            (totalImmersion._sum.seconds ?? 0) -
            (latestReport?.totalImmersionTime ?? 0);
        console.log("Immersion since last report:", immersionSinceLastReport);

        const getMonthlySum = async (gte: Date, lt?: Date) =>
            (
                await client.immersionActivity.aggregate({
                    _sum: {seconds: true},
                    where: {userId, createdAt: {gte, ...(lt ? {lt} : {})}},
                })
            )._sum.seconds ?? 0;

        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        console.log("Calculating monthly immersion...");
        const monthlyImmersion = await getMonthlySum(startOfThisMonth);
        const monthlyImmersionLastMonth = await getMonthlySum(
            startOfLastMonth,
            startOfThisMonth
        );
        console.log(
            "Monthly immersion (this month vs last month):",
            monthlyImmersion,
            monthlyImmersionLastMonth
        );

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        console.log("Fetching immersion by source since:", thirtyDaysAgo);

        const immersionBySource = await client.immersionActivity.groupBy({
            by: ["activityName"],
            _sum: {seconds: true},
            where: {userId, createdAt: {gte: thirtyDaysAgo}},
        });
        console.log("Immersion by source:", immersionBySource);

        const immersionSources = immersionBySource.map(
            ({activityName, _sum}) => ({
                name: activityName,
                relativeValue: _sum.seconds ?? 0,
            })
        );
        console.log("Formatted immersion sources:", immersionSources);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        console.log("Fetching weekly immersion since:", sevenDaysAgo);

        const weekly = await client.immersionActivity.findMany({
            where: {userId, createdAt: {gte: sevenDaysAgo}},
            select: {createdAt: true, seconds: true},
        });
        console.log("Weekly immersion raw data:", weekly);

        const immersionStreak = Array(7).fill(0);
        weekly.forEach(({createdAt, seconds}) => {
            const day = Math.floor(
                (new Date(createdAt).setHours(0, 0, 0, 0) - sevenDaysAgo.getTime()) /
                86400000
            );
            if (day >= 0 && day < 7) immersionStreak[day] += seconds ?? 0;
        });
        console.log("Weekly immersion streak array:", immersionStreak);

        const immersionDTO: Static<typeof ImmersionDTOSchema> = {
            totalImmersion: totalImmersion._sum.seconds ?? 0,
            immersionSinceLastReport,
            monthlyImmersion,
            monthlyImmersionLastMonth,
            immersionSources,
            immersionStreak,
        };
        console.log("Final immersionDTO:", immersionDTO);

        console.log("Step 8: Computing Anki DTO for user:", userId);
        const retention = createdSync.ankiData?.retention ?? 0;
        const retentionDelta = retention - (latestReport?.ankiData?.retention ?? 0);
        const reviews = createdSync.ankiData?.totalCardsStudied ?? 0;
        const reviewsDelta =
            reviews - (latestReport?.ankiData?.totalCardsStudied ?? 0);
        console.log(
            "Anki stats:",
            JSON.stringify(
                {retention, retentionDelta, reviews, reviewsDelta},
                null,
                2
            )
        );

        const ankiDTO =
            ankiToken || url
                ? {
                    retentionRate: retention,
                    retentionRateDelta: retentionDelta,
                    totalReviews: reviews,
                    reviewsDelta,
                }
                : undefined;
        console.log("Final ankiDTO:", ankiDTO);

        console.log("Step 9: Calculating next report time for user:", userId);
        const autoGenTime =
            (
                await client.userConfig.findUnique({
                    where: {userId},
                    select: {autoGenTime: true},
                })
            )?.autoGenTime ?? null;
        let nextReport: number | null = null;

        if (autoGenTime) {
            console.log("Auto-gen time from config:", autoGenTime);

            const seconds = autoGenTime.secondsSinceMidnight % 60;
            const minutes = Math.floor(
                (autoGenTime.secondsSinceMidnight % 3600) / 60
            );
            const hours = Math.floor(autoGenTime.secondsSinceMidnight / 3600);

            console.log(
                `${dayjs().format("YYYY-MM-DD")} ${hours}:${minutes}:${seconds}`
            );

            const candidate = dayjs
                .tz(
                    `${dayjs().format("YYYY-MM-DD")} ${hours}:${minutes}:${seconds}`,
                    autoGenTime.timezone
                )
                .toDate();

            if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
            console.log("candidate is " + candidate);

            nextReport = candidate.getTime();
            console.log(
                "Next report scheduled at:",
                new Date(nextReport).toISOString()
            );
        } else {
            console.log("No autoGenTime configured for user:", userId);
        }

        console.log("=== SYNC COMPLETE for user:", userId, "===");

        if ((await client.syncData.count({
            where: {userId}
        })) == 1) {
            client.syncData.update({
                where: {id: createdSync.id},
                data: {
                    report: {
                        create: {
                            reportNo: 0,
                            userId: userId,
                            score: 0,
                            averageImmersionTime: 0,
                            bestImmersionTime: 0,
                            metadata: {
                                create: {
                                    hasAnki: ankiToken != null || url != null,
                                }
                            }
                        }
                    }
                }
            });
        }

        return {
            userName: user.userName ?? user.email,
            profile_picture: user.profilePicture ?? "",
            lastSyncTime: createdSync.generationTime.toISOString(),
            lastReportTime: latestReport?.generationTime.toISOString() ?? "",
            immersionDTO,
            ankiDTO,
            nextReport,
        } as Static<typeof DashboardDTOSchema>;
    },
    {
        headers: authHeaders,
        response: {
            200: DashboardDTOSchema,
            404: t.Object({
                message: t.String(),
                code: t.Literal("ConfigNotFound"),
            }),
            500: t.Null(),
        },
        detail: {
            summary: "Sync user data (immersion + Anki)",
            tags: ["User"],
            description:
                "Synchronizes immersion and Anki data, returning up-to-date metrics for dashboard rendering.",
        },
    }
);
