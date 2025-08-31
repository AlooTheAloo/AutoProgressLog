import { Elysia, t } from "elysia";
import { authGuard, authHeaders } from "../../../middlewares/authGuard";
import { RateLimiterFactory } from "../../../middlewares/rateLimiter";
import AnkiStorage from "../../../services/anki/AnkiStorage";

/**
 * ## GET /mature
 *
 * This endpoint handles fetching the user's mature cards count.
 *
 * ---
 *
 * ### 🔓 Protected Access
 * This endpoint is protected by the Auth Guard and a Rate Limiter.
 *
 * ---
 *
 * ### 📦 Request Format:
 * `${URL}/storage/anki/mature`
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
 * await api.storage.anki.mature.get({
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
export const matureRoute = new Elysia({ name: "anki_mature" })
  .use(authGuard)
  .use(RateLimiterFactory.for("default"))
  .get(
    "/mature/",
    async ({ set, user }) => {
      const userId = user.id;
      const matureCards = await AnkiStorage.getMatureCards(userId);

      if (matureCards == null) {
        set.status = 500;
        return { error: "Anki data not found" };
      }

      set.status = 200;
      return { matureCards };
    },
    {
      headers: authHeaders,
      response: t.Union([
        t.Object({
          matureCards: t.Integer(),
        }),
        t.Object({ error: t.String() }),
      ]),
      detail: {
        summary: "Get mature cards count",
        tags: ["Storage"],
        description:
          "Get all mature cards from the user's apl-storage anki database.",
      },
    }
  );
