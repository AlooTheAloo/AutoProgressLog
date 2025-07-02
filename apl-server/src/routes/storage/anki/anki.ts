import { Elysia, t } from "elysia";
import { createEmailToken } from "../../../services/auth/token";
import prisma from "../../../db/client";
import { sendMagicLink } from "../../../services/email/sendMagicLink";
import { authGuard } from "../../../middlewares/authGuard";
import { RateLimiterFactory } from "../../../middlewares/rateLimiter";
import AnkiStorage from "../../../services/anki/AnkiStorage";

/**
 * ## POST /ankiData/:userId
 *
 * This endpoint handles fetching the user's Anki data.
 * It will:
 * - ✅ Find the total cards studied
 * - ✅ Find the retention rate according to the user's settings
 * - ✅ Find the mature cards count
 *
 * ---
 *
 * ### 🔓 Protected Access
 * The body must contain a valid token.
 *
 * ---
 *
 * ### 🧠 Step-by-step logic:
 * 1. Accepts a `POST` request with `{ email }` in the body
 * 2. Checks if a user already exists with that email
 *    - If not, creates a new user record
 *    - If yes, just proceeds
 * 3. Generates a secure token linked to the user's ID
 * 4. Sends an email containing a magic link (login URL with token)
 * 5. Responds with empty 204 (no content), or 201 if user was just created
 *
 * ---
 *
 * ### ⚠️ Security Considerations
 *
 * ---
 *
 * ### 📦 Request Format:
 * ```json
 * {
 *   "email": "youssef@youssef.dev"
 * }
 * ```
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
 * await api.auth.login({ email: 'youssef@youssef.dev' });
 * // User receives a magic link in their inbox
 * ```
 */
export const loginRoute = new Elysia({ name: "login" })
  .use(authGuard)
  .use(RateLimiterFactory.for("default"))
  .post(
    "/all/:userId",
    async ({ params, set }) => {
      const userId = params.userId;
      const [matureCards, retention, totalCards] = await Promise.all([
        AnkiStorage.getMatureCards(userId),
        AnkiStorage.getRetention(userId),
        AnkiStorage.getAnkiCardReviewCount(userId),
      ]);

      if (matureCards == null || retention == null || totalCards == null) {
        set.status = 500;
        return { error: "Anki data not found" };
      }

      set.status = 200;
      return { matureCards, retention, totalCards };
    },
    {
      params: t.Object({
        userId: t.Integer(),
      }),
      response: t.Union([
        t.Object({
          matureCards: t.Integer(),
          retention: t.Number(),
          totalCards: t.Object({
            count: t.Array(t.Object({ count: t.Integer(), did: t.Integer() })),
            totalCount: t.Integer(),
          }),
        }),
        t.Object({ error: t.String() }),
      ]),
      detail: {
        summary: "Login",
        tags: ["Auth"],
        description:
          "Starts the passwordless login process by sending a magic link to the user's email address.",
      },
    }
  );
