import {Elysia, t} from "elysia"
import {authHeaders, authGuard} from "../../middlewares/authGuard";
import {Toggl} from "toggl-track";
import AnkiHTTPClient from "../../services/anki/AnkiHTTPClient";
import AnkiStorage from "../../services/anki/AnkiStorage";
import NormalSyncer from "../../services/anki/NormalSyncer";

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
                const {username, password} = body;
                const response = await new AnkiHTTPClient().login(username, password);
                if (!response) {
                    set.status = 401; // Unauthorized
                    return {error: 'Invalid Anki credentials'};
                }
                set.status = 200; // OK
             //TODO: Download the Anki DB in apl-storage
             //TODO: getDeckCards and return the decks
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
                }),
                headers: authHeaders,
                detail: {
                    summary: 'Verify Anki credentials for specified user',
                    tags: ['User'],
                    description: 'This endpoint verifies the provided Anki credentials by attempting to log in.',
                },
            }
        )
);