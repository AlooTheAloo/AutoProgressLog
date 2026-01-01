import { Elysia, t } from "elysia";
import { authGuard, authHeaders } from "../../../middlewares/authGuard";
import { RateLimiterFactory } from "../../../middlewares/rateLimiter";
import AnkiStorage from "../../../services/anki/AnkiStorage";

/**
 * ## GET /reviews
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
 * `${URL}/storage/anki/reviews/`
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
 * api.storage.anki.mature.get({
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
export const reviewsRoute = new Elysia({ name: "anki_reviews" })
  .use(authGuard)
  .use(RateLimiterFactory.for("default"))
  .get(
    "/reviews/",
    async ({ user, set }) => {
      const userId = user.id;
      const reviews = await AnkiStorage.getAnkiCardReviewCount(userId);

      if (reviews == null) {
        set.status = 500;
        return { error: "Anki data not found" };
      }

      set.status = 200;
      return { reviews };
    },
    {
      headers: authHeaders,
      response: t.Union([
        t.Object({
          reviews: t.Object({
            count: t.Array(t.Object({ count: t.Integer(), did: t.Integer() })),
            totalCount: t.Integer(),
          }),
        }),
        t.Object({ error: t.String() }),
      ]),
      detail: {
        summary: "Get user's reviews count",
        tags: ["Storage"],
        description:
          "Get user's review count per deck and total count from the user's apl-storage anki database.",
      },
    }
  );
