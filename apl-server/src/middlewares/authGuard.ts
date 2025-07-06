import { Elysia, t } from "elysia";
import prisma from "../db/client";

/**
 * ## 🧾 Auth Header Schema
 *
 * This defines the **expected structure of the `Authorization` header** for protected endpoints.
 * - The format is: `Bearer <session_token>`
 * - The `^Bearer (.+)$` pattern ensures that the token is prefixed with `'Bearer '` followed by the actual token string.
 *
 * This is used inside the `authGuard` to validate incoming requests.
 */
export const authHeaders = t.Object({
  authorization: t.String({
    pattern: "^Bearer (.+)$",
  }),
});

/**
 * ## 🛡️ authGuard — Auth Middleware
 *
 * This is a **global authentication guard** used to protect routes in your server.
 *
 * ---
 *
 * ### 🧠 What it does:
 * 1. Extracts the `Authorization` header and pulls the session token.
 * 2. Looks up the token in the database using Prisma.
 * 3. If valid:
 *    - Ensures it's a **SESSION** type token
 *    - Not expired
 *    - Belongs to a real user
 * 4. On success, it attaches:
 *    - `user`: the authenticated user object
 *    - `sessionToken`: the raw token string
 *    These are now available to **every route that uses this guard.**
 * 5. On failure, responds with `401 Unauthorized`.
 *
 * ---
 *
 * ### 🔐 How to use:
 *
 * Wrap routes using:
 * ```ts
 *
 * new Elysia().use(authGuard).get('/secure', ({ user }) => ...)
 * ```
 *
 * ---
 *
 * ### 🔄 Example header:
 * ```
 * Authorization: Bearer abc.def.ghi
 * ```
 */
export const authGuard = new Elysia({ name: "auth-guard" })

  // Apply the header schema to all guarded routes
  .guard({
    headers: authHeaders,
  })

  // Resolve runs BEFORE route handlers. It checks the token and exposes `user` & `sessionToken`
  .resolve({ as: "scoped" }, async ({ headers, set }) => {
    // 🧱 Step 1: Extract the token from the "Authorization" header
    const tokenValue = headers.authorization?.split(" ")[1];

    // 🧱 Step 2: Look up the token in the DB
    const token = await prisma.token
      .findUniqueOrThrow({
        where: { token: tokenValue },
        include: { user: true },
      })
      .catch(() => {
        // 🚫 Token not found
        set.status = 401;
        throw new Error("Invalid or missing session token");
      });

    const now = new Date();
    console.log(token);

    // 🧱 Step 3: Validate token properties
    if (
      !token ||
      !token.valid || // Must be still marked as valid
      token.type !== "SESSION" || // Only allow session-type tokens
      (token.expiration && token.expiration < now) // Reject if expired
    ) {
      set.status = 401;
      throw new Error("Invalid or expired session token");
    }

    // 🧱 Step 4: Update lastUsedAt (for audit/session tracking)
    await prisma.token.update({
      where: { id: token.id },
      data: { lastUsedAt: now },
    });

    // ✅ Step 5: Inject the user + token into the route context
    return {
      user: token.user,
      sessionToken: tokenValue,
    };
  });
