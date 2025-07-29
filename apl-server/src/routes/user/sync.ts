import {Elysia, t, Static} from 'elysia';
import {authGuard, authHeaders} from '../../middlewares/authGuard';
import client from '../../db/client';
import AnkiStorage from '../../services/anki/AnkiStorage';
import NormalSyncer from '../../services/anki/NormalSyncer';
import AnkiHTTPClient from '../../services/anki/AnkiHTTPClient';

// -- SCHEMAS --
const ImmersionDTOSchema = t.Object({
    totalImmersion: t.Number(),
    immersionSinceLastReport: t.Number(),
    monthlyImmersion: t.Number(),
    monthlyImmersionLastMonth: t.Number(),
    immersionSources: t.Array(t.Object({name: t.String(), relativeValue: t.Number()})),
    immersionStreak: t.Array(t.Number())
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
    nextReport: t.Union([t.Number(), t.Null()])
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
export const syncRoute = new Elysia({name: 'sync-route'})
    .use(authGuard)
    .post(
        '/sync',
        async ({user, set}) => {
            const userId = user.id;

            // 1. Get Anki Config
            const {ankiToken, url} = await client.userConfig
                .findUnique({where: {userId}, include: {ankiConfig: true}})
                .ankiConfig({select: {ankiToken: true, url: true}}) ?? {};

            // 2. Run sync if Anki is configured
            if (ankiToken || url)
                await new NormalSyncer(new AnkiHTTPClient(ankiToken, url), userId).start();

            // 3. Aggregate immersion and anki data
            const totalImmersion = await client.immersionActivity.aggregate({where: {userId}, _sum: {seconds: true}});
            const latestSync = await client.syncData.findFirst({
                orderBy: {generationTime: 'desc'},
                where: {userId, ankiData: {isNot: null}},
                include: {ankiData: true}
            });

            const createdSync = await client.syncData.create({
                data: {
                    userId,
                    totalImmersionTime: totalImmersion._sum.seconds ?? 0,
                    ankiData: ankiToken || url ? {
                        create: {
                            totalCardsStudied: await AnkiStorage.getAnkiCardReviewCount(userId).then(r => r.totalCount ?? 0),
                            cardsStudied: await AnkiStorage.getAnkiCardReviewCount(userId).then(r => Math.abs((r.totalCount ?? 0) - (latestSync?.ankiData?.totalCardsStudied ?? 0))),
                            mature: await AnkiStorage.getMatureCards(userId) ?? 0,
                            retention: await AnkiStorage.getRetention(userId) ?? 0,
                        }
                    } : undefined
                },
                include: {ankiData: true}
            });

            const latestReport = await client.syncData.findFirst({
                orderBy: {generationTime: 'desc'},
                where: {userId, report: {isNot: null}},
                include: {ankiData: true}
            });

            // 4. Compute immersion metrics
            const immersionSinceLastReport = (totalImmersion._sum.seconds ?? 0) - (latestReport?.totalImmersionTime ?? 0);

            const getMonthlySum = async (gte: Date, lt?: Date) =>
                (await client.immersionActivity.aggregate({
                    _sum: {seconds: true},
                    where: {userId, createdAt: {gte, ...(lt ? {lt} : {})}}
                }))._sum.seconds ?? 0;

            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const monthlyImmersion = await getMonthlySum(startOfThisMonth);
            const monthlyImmersionLastMonth = await getMonthlySum(startOfLastMonth, startOfThisMonth);

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);

            const immersionBySource = await client.immersionActivity.groupBy({
                by: ['activityName'],
                _sum: {seconds: true},
                where: {userId, createdAt: {gte: thirtyDaysAgo}}
            });

            const immersionSources = immersionBySource.map(({activityName, _sum}) => ({
                name: activityName,
                relativeValue: _sum.seconds ?? 0
            }));

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setHours(0, 0, 0, 0);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

            const weekly = await client.immersionActivity.findMany({
                where: {userId, createdAt: {gte: sevenDaysAgo}},
                select: {createdAt: true, seconds: true}
            });

            const immersionStreak = Array(7).fill(0);
            weekly.forEach(({createdAt, seconds}) => {
                const day = Math.floor((new Date(createdAt).setHours(0, 0, 0, 0) - sevenDaysAgo.getTime()) / 86400000);
                if (day >= 0 && day < 7) immersionStreak[day] += seconds ?? 0;
            });

            const immersionDTO: Static<typeof ImmersionDTOSchema> = {
                totalImmersion: totalImmersion._sum.seconds ?? 0,
                immersionSinceLastReport,
                monthlyImmersion,
                monthlyImmersionLastMonth,
                immersionSources,
                immersionStreak,
            };

            // 5. Anki DTO if applicable
            const retention = createdSync.ankiData?.retention ?? 0;
            const retentionDelta = retention - (latestReport?.ankiData?.retention ?? 0);
            const reviews = createdSync.ankiData?.totalCardsStudied ?? 0;
            const reviewsDelta = reviews - (latestReport?.ankiData?.totalCardsStudied ?? 0);

            const ankiDTO = ankiToken || url
                ? {retentionRate: retention, retentionRateDelta: retentionDelta, totalReviews: reviews, reviewsDelta}
                : undefined;

            // 6. Next report time
            const autoGenTime = (await client.userConfig.findUnique({
                where: {userId},
                select: {autoGenTime: true}
            }))?.autoGenTime ?? null;
            let nextReport: number | null = null;

            if (autoGenTime) {
                const candidate = new Date(now);
                candidate.setHours(autoGenTime.getHours(), autoGenTime.getMinutes(), autoGenTime.getSeconds(), 0);
                if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
                nextReport = candidate.getTime();
            }

            return {
                userName: user.userName ?? user.email,
                profile_picture: user.profilePicture ?? '',
                lastSyncTime: createdSync.generationTime.toISOString(),
                lastReportTime: latestReport?.generationTime.toISOString() ?? '',
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
                    code: t.Literal('ConfigNotFound')
                }),
                500: t.Null()
            },
            detail: {
                summary: 'Sync user data (immersion + Anki)',
                tags: ['User'],
                description: 'Synchronizes immersion and Anki data, returning up-to-date metrics for dashboard rendering.',
            }

        }
    );
