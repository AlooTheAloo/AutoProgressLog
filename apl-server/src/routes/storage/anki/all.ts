import { Elysia, t } from "elysia";
import { createEmailToken } from "../../../services/auth/token";
import prisma from "../../../db/client";
import { sendMagicLink } from "../../../services/email/sendMagicLink";
import { authGuard, authHeaders } from "../../../middlewares/authGuard";
import { RateLimiterFactory } from "../../../middlewares/rateLimiter";
import AnkiStorage from "../../../services/anki/AnkiStorage";

/**
 * ## GET /all
 *
 * This endpoint handles fetching ALL the user's Anki data.
 * It will:
 * - ✅ Find the total cards studied
 * - ✅ Find the retention rate according to the user's settings
 * - ✅ Find the mature cards count
 *
 * ---
 *
 * ### 🔓 Protected Access
 * This endpoint is protected by the Auth Guard and a Rate Limiter.
 *
 * ---
 *
 * ### 📦 Request Format:
 * `${URL}/storage/anki/all/727`
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
 * await api.storage.anki.all.get({
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
export const allRoute = new Elysia({ name: "anki_all" })
  .use(authGuard)
  .use(RateLimiterFactory.for("default"))
  .get(
    "/all",
    async ({ user, set }) => {
      const userId = user.id;
      const [matureCards, retention, reviews] = await Promise.all([
        AnkiStorage.getMatureCards(userId),
        AnkiStorage.getRetention(userId),
        AnkiStorage.getAnkiCardReviewCount(userId),
      ]);

      if (matureCards == null || retention == null || reviews == null) {
        set.status = 500;
        return { error: "Anki data not found" };
      }

      set.status = 200;
      return { matureCards, retention, reviews };
    },
    {
      headers: authHeaders,
      response: t.Union([
        t.Object({
          matureCards: t.Integer(),
          retention: t.Number(),
          reviews: t.Object({
            count: t.Array(t.Object({ count: t.Integer(), did: t.Integer() })),
            totalCount: t.Integer(),
          }),
        }),
        t.Object({ error: t.String() }),
      ]),
      detail: {
        summary: "Get all a user's anki data",
        tags: ["Storage"],
        description:
          "Get all anki data linked to a user. This includes the total cards studied, the retention rate, and the mature cards count.",
      },
    }
  );
