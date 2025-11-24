import {Elysia, t} from "elysia";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {buildReport} from "../../services/reports/buildReport";
import client from "../../db/client";
import {getReport} from "../../services/reports/getReport";

export const reportRoute = new Elysia({name: 'report-route'}).use(authGuard)
    .post(
        "/report",
        async ({user}) => {
            try{
                await buildReport(user.id)
            }
            catch (e){
                console.log("ERROR!!! " + e)
            }   
            console.log("It just works.")
            return {status: "Report successfully generated"};
        },
        {
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
        async ({user}) => {
            const reports = await client.syncData.findMany({
                where: {
                    userId: user.id,
                    report: {
                        isNot: null
                    }
                },
                include: {
                    report: {
                        include: {
                            score: true
                        }
                    }
                },
                orderBy: {
                    generationTime: 'desc'
                }
            });

            return reports
                .filter(r => r.report!.reportNo !== 0)
                .map(r => ({
                    id: r.report!.reportNo,
                    score: {
                        immersionScore: r.report!.score?.immersionScore ?? 0,
                        ankiScore: r.report!.score?.ankiScore ?? 0,
                        totalScore: r.report!.score?.totalScore ?? 0,
                    },
                    date: r.generationTime.toISOString(),
                    fileExists: true,
                    revertable: false
                }));
        },
        {
            headers: authHeaders,
            response: {
                200: t.Array(t.Object({
                    id: t.Number(),
                    score: t.Object({
                        immersionScore: t.Number(),
                        ankiScore: t.Number(),
                        totalScore: t.Number()
                    }),
                    date: t.String(),
                    fileExists: t.Boolean(),
                    revertable: t.Optional(t.Boolean())
                }))
            }
        }
    )
    .get(
        "/report/:id",
        async ({user, params: {id}}) => {
            const report = await getReport(user.id, parseInt(id));
            return report;
        },
        {
            headers: authHeaders,
            params: t.Object({
                id: t.String()
            })
        }
    )