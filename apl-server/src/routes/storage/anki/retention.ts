import { Elysia, t } from "elysia";
import { authGuard, authHeaders } from "../../../middlewares/authGuard";
import { RateLimiterFactory } from "../../../middlewares/rateLimiter";
import AnkiStorage from "../../../services/anki/AnkiStorage";

/**
 * ## GET /retention
 *
 * This endpoint handles fetching the user's retention rate. It will return the percentage according to the user's settings as a number from 0 to 100.
 *
 * ---
 *
 * ### 🔓 Protected Access
 * This endpoint is protected by the Auth Guard and a Rate Limiter.
 *
 * ---
 *
 * ### 📦 Request Format:
 * `${URL}/storage/anki/retention`
 *
 * ---
 *
 * ### 🧪 Example usage with Eden:
 * ```ts
 * import { eden } from '@elysiajs/eden';
 * import type { APLServer } from '~/server';
 *
 * const api = eden<typeof APLServer>('https://api.autoprogresslog.com');
 *
 * api.storage.anki.retention.get({
 *   headers: {
 *     authorization: `Bearer ${token}`,
 *   },
 * });
 * ```
 *
 * ### 🔄 Response:
 * - ✅ `200 OK` on success
 * - ❌ `401 Unauthorized` if the token is not valid or not owned
 */
export const retentionRoute = new Elysia({ name: "anki_retention" })
  .use(authGuard)
  .use(RateLimiterFactory.for("default"))
  .get(
    "/retention/",
    async ({ user, set }) => {
      const userId = user.id;
      const retentionRate = await AnkiStorage.getRetention(userId);

      if (retentionRate == null) {
        set.status = 500;
        return { error: "Anki data not found" };
      }

      set.status = 200;
      return { retentionRate };
    },
    {
      headers: authHeaders,
      response: t.Union([
        t.Object({
          retentionRate: t.Number(),
        }),
        t.Object({ error: t.String() }),
      ]),
      detail: {
        summary: "Get retention rate",
        tags: ["Storage"],
        description:
          "Get retention rate from the user's apl-storage anki database according to the algorithm decided by the user's settings.",
      },
    }
  );
