import {Elysia, t} from "elysia";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {buildReport} from "../../services/reports/buildReport";

export const reportRoute = new Elysia({name: 'report-route'}).use(authGuard).post(
    "/report",
    async ({user}) => {
        await buildReport(user.id)
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