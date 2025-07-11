import {Elysia, t} from "elysia"
import {authHeaders, authGuard} from "../../middlewares/authGuard";
import {Toggl} from "toggl-track";

export const verifyProviderRoutes = new Elysia({name: 'verify-provider-routes'}).use(authGuard).group('/verify-provider',
    app => app
        .post('/toggl', async ({body, set}) => {
                const {togglToken} = body;
                const res = await new Toggl({
                    auth: {
                        token: togglToken
                    }
                }).me.get();
                set.status = res.status
                return
            },
            {
                body: t.Object({
                    togglToken: t.String({
                        example: '4f5c54c6-1234-abc123',
                        description: 'Your Toggl API token',
                    }),
                }),
                headers: authHeaders,
                response: t.Void()
            }
        )
);