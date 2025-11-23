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
                    report: true
                },
                orderBy: {
                    generationTime: 'desc'
                }
            });

            return reports.map(r => ({
                id: r.report!.reportNo,
                score: r.report!.score,
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
                    score: t.Number(),
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