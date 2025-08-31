import {Elysia, t} from "elysia";
import client from "../../db/client";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {__nullable__} from "../../../prisma/types/__nullable__";
import {UserConfigPlain} from "../../../prisma/types/UserConfig";
import {AnkiConfigPlain} from "../../../prisma/types/AnkiConfig";
import createWebhook from "../../integrations/toggl/createWebhook";
import deleteWebhook from "../../integrations/toggl/deleteWebhook";
import Toggl from "toggl-track";
import {reportCronPlugin} from "../../middlewares/cronReportGenerator";
import {buildReport} from "../../services/reports/buildReport";

// Define what part of the config we expose publicly
const PublicUserConfig = t.Omit(UserConfigPlain, ["id", "userId"]);
const PublicAnkiConfig = t.Omit(AnkiConfigPlain, [
    "id",
    "userConfigId",
] as const);

/**
 * ## /config Routes (Grouped under configRoutes)
 *
 * These routes allow a user to:
 * - ✅ Fetch their configuration
 * - ✅ Create a configuration
 * - ✅ Update their configuration
 *
 * ---
 *
 * ### 🧠 What is "user configuration"?
 * This typically includes settings like:
 * - `togglToken`: a personal API key for Toggl integration
 * - `autoGenTime`: a boolean to toggle auto time generation
 *
 * ---
 *
 * All endpoints are protected by `authGuard`, meaning the authenticated `user` is injected automatically.
 */
export const configRoutes = new Elysia({name: "config-routes"})
    .use(authGuard)
    .use(reportCronPlugin({
        prisma: client,
        buildReport: buildReport,
        reconcilePattern: "*/1 * * * *", // Every minute
        timezoneForUser: async (userId) => {
            return 'America/Toronto' // Later, fetch from user profile
        }
    }))

    /**
     * ## GET /config
     *
     * Get the configuration for the currently authenticated user.
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Retrieves the user's configuration using their `user.id`
     * - Selects and returns only the safe fields (no ID)
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * // Attach headers with auth token
     * const config = await api.user.config.get();
     * console.log(config?.autoGenTime);
     * ```
     */
    .get(
        "/config",
        async ({user}) => {
            return client.userConfig.findUnique({
                where: {userId: user.id},
                select: {
                    togglToken: true,
                    togglUserId: true,
                    autoGenTime: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        },
        {
            headers: authHeaders,
            response: __nullable__(PublicUserConfig),
            detail: {
                summary: "Get user configuration",
                tags: ["User"],
                description:
                    "Returns the current configuration for the authenticated user.",
            },
        }
    )

    /**
     * ## PATCH /config
     *
     * Update fields in the user's configuration.
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Accepts a partial config (`togglToken`, `autoGenTime`)
     * - Updates the user's configuration record using their `user.id`
     * - Returns the updated record
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * const updated = await api.user.config.patch({
     *   togglToken: 'abc123',
     *   autoGenTime: true
     * });
     * ```
     */
    .patch(
        "/config",
        async ({body, user, set, reportCron}) => {
            const oldConfig = await client.userConfig.findUnique({
                where: {userId: user.id},
                select: {togglToken: true, togglUserId: true},
            });
            console.log("old toggl token is " + oldConfig?.togglToken);
            console.log("new toggl token is " + body.togglToken);

            let me;
            if (oldConfig?.togglToken !== body.togglToken) {
                if (oldConfig?.togglToken)
                    await deleteWebhook(-1, oldConfig?.togglToken);
                me = await createWebhook(-1, body.togglToken);
                if (me == undefined) {
                    set.status = 500;
                    throw new Error("Toggl webhook creation failed");
                }
            }

            console.log("we so out of here, but we got " + JSON.stringify(me));

            const {togglToken} = body;
            console.log("getting toggl id for user with token " + togglToken);

            const updatedConfig = await client.userConfig.update({
                where: {userId: user.id},
                data: {
                    togglUserId: me?.uid.toString() ?? oldConfig?.togglUserId,
                    togglToken: body.togglToken,
                    autoGenTime: body.autoGenTime,
                },
                select: {
                    togglToken: true,
                    autoGenTime: true,
                    togglUserId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if(!updatedConfig.autoGenTime) reportCron.detach(user.id)
            else reportCron.attach(user.id)

            return updatedConfig;
        },
        {
            headers: authHeaders,
            body: t.Omit(UserConfigPlain, [
                "id",
                "userId",
                "createdAt",
                "updatedAt",
                "togglUserId",
            ]),
            response: PublicUserConfig,
            detail: {
                summary: "Update user configuration",
                tags: ["User"],
                description:
                    "Allows the authenticated user to update their configuration settings.",
            },
        }
    )

    /**
     * ## POST /config
     *
     * Create a configuration for the authenticated user (usually on first login).
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Creates a new `userConfig` row for the logged-in user
     * - Uses their `user.id` as the foreign key
     * - Returns the created configuration fields
     *
     * ---
     *
     * ### 🔁 Note:
     * - If a config already exists, this may cause a constraint violation.
     *   Consider using `upsert` in the future if needed.
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * const config = await api.user.config.post({
     *   togglToken: 'xyz987',
     *   autoGenTime: false
     * });
     * ```
     */
    .post(
        "/config",
        async ({body, user, reportCron}) => {
            await createWebhook(-1, body.togglToken);
            const createdConfig = await client.userConfig.create({
                data: {
                    togglToken: body.togglToken,
                    togglUserId: body.togglUserId,
                    autoGenTime: body.autoGenTime,
                    userId: user.id,
                },
                select: {
                    togglToken: true,
                    togglUserId: true,
                    autoGenTime: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if(createdConfig.autoGenTime) reportCron.attach(user.id)
            return createdConfig;
        },
        {
            headers: authHeaders,
            body: t.Omit(UserConfigPlain, ["id", "userId", "createdAt", "updatedAt"]),
            response: PublicUserConfig,
            detail: {
                summary: "Create user configuration",
                tags: ["User"],
                description:
                    "Creates a new configuration record for the authenticated user.",
            },
        }
    )
    /**
     * ## GET /config/anki
     *
     * Get the Anki configuration for the authenticated user.
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Retrieves the user's Anki configuration using their `user.id`
     * - Returns only the safe fields (no ID)
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * const ankiConfig = await api.user.config.anki.get();
     * console.log(ankiConfig?.url);
     * ```
     */
    .get(
        "/config/anki",
        async ({user, set}) => {
            const associatedConfig = await client.userConfig.findUnique({
                where: {userId: user.id},
            });
            const config = await client.ankiConfig.findUnique({
                where: {userConfigId: associatedConfig?.id},
                select: {
                    url: true,
                    ankiToken: true,
                    retentionMode: true,
                    trackedDecks: true,
                },
            });
            if (config == null) {
                set.status = 404;
                return null;
            } else return config;
        },
        {
            headers: authHeaders,
            response: __nullable__(PublicAnkiConfig),
            detail: {
                summary: "Get Anki configuration",
                tags: ["User"],
                description:
                    "Returns the Anki configuration for the authenticated user.",
                responses: {
                    200: {
                        description: "Return anki configuration for the authenticated user",
                    },
                    404: {
                        description: "No user anki configuration found",
                    },
                },
            },
        }
    )

    /**
     * ## PATCH /config/anki
     *
     * Update the Anki configuration for the authenticated user.
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Accepts a partial Anki config (`url`, `ankiToken`, `retentionMode`, `trackedDecks`)
     * - Updates the user's Anki configuration record using their `user.id`
     * - Returns the updated record
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * const updatedAnkiConfig = await api.user.config.anki.patch({
     *   url: 'http://localhost:8765',
     *   ankiToken: 'my-anki-token',
     *   retentionMode: 'ANKI_DEFAULT',
     *   trackedDecks: [1, 2, 3]
     * });
     * ```
     */
    .patch(
        "/config/anki",
        async ({body, user}) => {
            const associatedConfig = await client.userConfig.findUnique({
                where: {userId: user.id},
            });
            return client.ankiConfig.update({
                where: {userConfigId: associatedConfig?.id},
                data: {
                    url: body.url,
                    ankiToken: body.ankiToken,
                    retentionMode: body.retentionMode,
                    trackedDecks: body.trackedDecks,
                },
                select: {
                    url: true,
                    ankiToken: true,
                    retentionMode: true,
                    trackedDecks: true,
                },
            });
        },
        {
            headers: authHeaders,
            body: PublicAnkiConfig,
            response: PublicAnkiConfig,
            detail: {
                summary: "Update Anki configuration",
                tags: ["User"],
                description:
                    "Allows the authenticated user to update their Anki configuration settings.",
            },
        }
    )

    /**
     * ## POST /config/anki
     *
     * Create an Anki configuration for the authenticated user.
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Creates a new `ankiConfig` row for the logged-in user
     * - Uses their `user.id` as the foreign key
     * - Returns the created configuration fields
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * const ankiConfig = await api.user.config.anki.post({
     *  url: 'http://localhost:8765',
     *  ankiToken: 'my-anki-token',
     *  retentionMode: 'ANKI_DEFAULT',
     *  trackedDecks: [1, 2, 3]
     *  });
     *  console.log(ankiConfig);
     *  ```
     *
     */
    .post(
        "/config/anki",
        async ({body, user}) => {
            const associatedConfig = await client.userConfig.findUnique({
                where: {userId: user.id},
            });
            if (!associatedConfig) {
                throw new Error(
                    "User configuration not found. Please create a user config first."
                );
            }
            return client.ankiConfig.create({
                data: {
                    url: body.url,
                    ankiToken: body.ankiToken,
                    retentionMode: body.retentionMode,
                    trackedDecks: body.trackedDecks,
                    userConfigId: associatedConfig?.id,
                },
                select: {
                    url: true,
                    ankiToken: true,
                    retentionMode: true,
                    trackedDecks: true,
                },
            });
        },
        {
            headers: authHeaders,
            body: PublicAnkiConfig,
            response: PublicAnkiConfig,
            detail: {
                summary: "Create Anki configuration",
                tags: ["User"],
                description:
                    "Creates a new Anki configuration record for the authenticated user.",
            },
        }
    )
    /**
     * ## DELETE /config/anki
     *
     * Delete Anki configuration of the authenticated user.
     *
     * ---
     *
     * ### 🧠 What it does:
     * - Finds the user's Anki configuration using their `user.id`
     * - Deletes the user's Anki configuration record using their `user.id`
     * - Returns the deleted record
     *
     * ---
     *
     * ### 🧪 Example usage (Eden):
     * ```ts
     * const ankiConfig = await api.user.config.anki.delete();
     * console.log(ankiConfig);
     * ```
     *
     * ---
     *
     */
    .delete(
        "/config/anki",
        async ({user, set}) => {
            const associatedConfig = await client.userConfig.findUnique({
                where: {userId: user.id},
            });
            if (!associatedConfig) {
                set.status = 404;
                return null;
            }
            return await client.ankiConfig.delete({
                where: {userConfigId: associatedConfig?.id},
            });
        },
        {
            headers: authHeaders,
            response: __nullable__(PublicAnkiConfig),
            detail: {
                summary: "Delete user's Anki configuration",
                tags: ["User"],
                description:
                    "Deletes the Anki configuration for the authenticated user if it exists.",
            },
        }
    );
