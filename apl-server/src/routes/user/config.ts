import { Elysia, t } from "elysia";
import client from "../../db/client";
import { authGuard, authHeaders } from "../../middlewares/authGuard";
import { __nullable__ } from "../../../prisma/types/__nullable__";
import { UserConfigPlain } from "../../../prisma/types/UserConfig";
import { AnkiConfigPlain } from "../../../prisma/types/AnkiConfig";

// Define what part of the config we expose publicly
const PublicUserConfig = t.Omit(UserConfigPlain, ["id", "userId"]);
const PublicAnkiConfig = t.Omit(AnkiConfigPlain, ["id", "userConfigId"]);

const BodyAnkiConfig = t.Intersect([
  t.Omit(AnkiConfigPlain, ["id", "userConfigId", "trackedDecks"] as const),
  t.Object({
    trackedDecks: t.Array(t.Integer(), { additionalProperties: false }),
  }),
]);

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
export const configRoutes = new Elysia({ name: "config-routes" })
  .use(authGuard)

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
    async ({ user }) => {
      return client.userConfig.findUnique({
        where: { userId: user.id },
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
    async ({ body, user }) => {
      return client.userConfig.update({
        where: { userId: user.id },
        data: {
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
    },
    {
      headers: authHeaders,
      body: t.Omit(UserConfigPlain, ["id", "userId", "createdAt", "updatedAt"]),
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
    async ({ body, user }) => {
      return client.userConfig.create({
        data: {
          togglToken: body.togglToken,
          autoGenTime: body.autoGenTime,
          togglUserId: body.togglUserId,
          userId: user.id,
        },
        select: {
          togglToken: true,
          autoGenTime: true,
          togglUserId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
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
    async ({ user }) => {
      const associatedConfig = await client.userConfig.findUnique({
        where: { userId: user.id },
      });
      return client.ankiConfig.findUnique({
        where: { userConfigId: associatedConfig?.id },
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
      response: __nullable__(PublicAnkiConfig),
      detail: {
        summary: "Get Anki configuration",
        tags: ["User"],
        description:
          "Returns the Anki configuration for the authenticated user.",
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
    async ({ body, user }) => {
      const associatedConfig = await client.userConfig.findUnique({
        where: { userId: user.id },
      });
      return client.ankiConfig.update({
        where: { userConfigId: associatedConfig?.id },
        data: {
          url: body.url,
          ankiToken: body.ankiToken,
          retentionMode: body.retentionMode,
          trackedDecks: body.trackedDecks.map((x) => BigInt(x)),
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
      body: BodyAnkiConfig,
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
    async ({ body, user }) => {
      const associatedConfig = await client.userConfig.findUnique({
        where: { userId: user.id },
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
          trackedDecks: body.trackedDecks.map((x) => BigInt(x)),
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
      body: BodyAnkiConfig,
      response: PublicAnkiConfig,
      detail: {
        summary: "Create Anki configuration",
        tags: ["User"],
        description:
          "Creates a new Anki configuration record for the authenticated user.",
      },
    }
  );
