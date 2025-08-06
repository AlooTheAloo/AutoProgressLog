import {Elysia, t} from "elysia"
import {authHeaders, authGuard} from "../../middlewares/authGuard";
import {Toggl} from "toggl-track";
import AnkiHTTPClient, {DEFAULT_ANKI_URL} from "../../services/anki/AnkiHTTPClient";
import AnkiStorage, {DeckTypeSchema} from "../../services/anki/AnkiStorage";

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
                response: t.Void(),
                detail: {
                    summary: 'Verify Toggl Token for specified user',
                    tags: ['User'],
                    description: 'This endpoint verifies the provided Toggl token by fetching the user details.',
                },
            }
        )
        .post('/anki', async ({body, set, user}) => {
                const {username, password, ankiUrl} = body;
                const response = await new AnkiHTTPClient("", ankiUrl ?? DEFAULT_ANKI_URL).login(username, password);
                if (!response) {
                    set.status = 401; // Unauthorized
                    return {error: 'Invalid Anki credentials'};
                }

                try {
                    await AnkiStorage.requestAnkiDBDownload(user.id, response, ankiUrl ?? DEFAULT_ANKI_URL);
                } catch (e: any) {
                    set.status = 500;
                    return {error: e.message};
                }

                try {
                    set.status = 200;
                    return AnkiStorage.getDecksCards(user.id);
                } catch (e: any) {
                    set.status = 500;
                    return {error: e.message};
                }
            },
            {
                body: t.Object({
                    username: t.String({
                        example: 'john_doe',
                        description: 'Your Anki username',
                    }),
                    password: t.String({
                        example: 'securepassword123',
                        description: 'Your Anki password',
                    }),
                    ankiUrl: t.Optional(t.String({
                        example: 'http://localhost:8765',
                        description: 'The URL of your AnkiConnect server',
                    }))
                }),
                headers: authHeaders,
                response: {
                    200: t.Array(DeckTypeSchema),
                    401: t.Object({
                        error: t.String(),
                    }),
                    500: t.Object({
                        error: t.String(),
                    }),
                },
                detail: {
                    summary: 'Verify Anki credentials for specified user',
                    tags: ['User'],
                    description: 'This endpoint verifies the provided Anki credentials by attempting to log in.',
                },
            }
        )
);