import {Elysia, t} from "elysia";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {buildReport} from "../../services/reports/buildReport";
import client from "../../db/client";
import {getReport} from "../../services/reports/getReport";

export const reportRoute = new Elysia({name: 'report-route'}).use(authGuard)
    .post(
        "/report",
        async ({user}) => {
            try {
                await buildReport(user.id)
            } catch (e) {
                console.log("ERROR!!! " + e)
            }
            console.log("It just works.")
            return {status: "Report successfully generated"};
        },
        {
            detail: {
                summary: "Generate report",
                tags: ["User"],
                description:
                "This endpoint generates a new report for the specified user",
            },
            headers: authHeaders,
            response: {
                200: t.Object({
                    status: t.String()
                })
            }
        }
    )
    .get(
        "/reports",
        async ({user, query}) => {
            const page = Math.max(1, Number(query.page) || 1);
            const pageSize = Math.min(100, Number(query.pageSize) || 20); // safety cap

            const skip = (page - 1) * pageSize;
            const take = pageSize;

            const [total, rows] = await Promise.all([
                client.syncData.count({
                    where: {
                        userId: user.id,
                        report: {isNot: null}
                    }
                }),

                client.syncData.findMany({
                    where: {
                        userId: user.id,
                        report: {isNot: null}
                    },
                    include: {
                        report: {
                            include: {score: true}
                        }
                    },
                    orderBy: {generationTime: "desc"},
                    skip,
                    take
                })
            ]);

            const totalPages = Math.ceil(total / pageSize);

            const reports = rows
                .filter(r => r.report!.reportNo !== 0)
                .map(r => ({
                    id: r.report!.reportNo,
                    score: {
                        immersionScore: r.report!.score?.immersionScore ?? 0,
                        ankiScore: r.report!.score?.ankiScore ?? 0,
                        totalScore: r.report!.score?.totalScore ?? 0
                    },
                    date: r.generationTime.toISOString(),
                    fileExists: true,
                    revertable: false
                }));

            return {
                page,
                pageSize,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
                data: reports
            };
        },
        {
            detail: {
                summary: "Get reports",
                tags: ["User"],
                description:
                "This endpoint gets a list of reports for the specified user using pagination",
            },
            headers: authHeaders,
            query: t.Object({
                page: t.Optional(t.Numeric()),
                pageSize: t.Optional(t.Numeric())
            }),
            response: {
                200: t.Object({
                    page: t.Number(),
                    pageSize: t.Number(),
                    total: t.Number(),
                    totalPages: t.Number(),
                    hasNextPage: t.Boolean(),
                    hasPrevPage: t.Boolean(),
                    nextPage: t.Union([t.Number(), t.Null()]),
                    prevPage: t.Union([t.Number(), t.Null()]),
                    data: t.Array(
                        t.Object({
                            id: t.Number(),
                            score: t.Object({
                                immersionScore: t.Number(),
                                ankiScore: t.Number(),
                                totalScore: t.Number()
                            }),
                            date: t.String(),
                            fileExists: t.Boolean(),
                            revertable: t.Optional(t.Boolean())
                        })
                    )
                })
            }
        }
    )

    .get(
        "/report/:id",
        async ({user, params: {id}}) => {
            return await getReport(user.id, parseInt(id));
        },
        {
            detail: {
                summary: "Get a report's data",
                tags: ["User"],
                description:
                "This endpoint gets a specific report for the specified user. It contains all the required information for the report's image to be displayed.",
            },
            headers: authHeaders,
            params: t.Object({
                id: t.String()
            })
        }
    )