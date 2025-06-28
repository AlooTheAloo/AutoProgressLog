import { Elysia, t } from "elysia";
import path from "path";
import { existsSync, createReadStream } from "fs";
import { executeQuery, getDBPath } from "../../services/db";

/**
 * @module queryRoute (apl-storage)
 *
 * ## 📊 Execute User Database Query
 * This route allows you to execute a database query (SELECT).
 * It will be ran against the specified user's database and return the result.
 * Available Tables : `cards`, `col`, `decks`, `revlog`
 * ---
 * ### 🧠 Responsibility
 * - This route **does not require authentication**
 * - Returns the response as a JSON object
 * ---
 *
 * ### 📂 Where does it look for databases?
 * It checks for a file at:
 * ```
 * ./public/ankidb/{userId}.collection.anki2
 * ```
 * Where `{userId}` is the UUID received from the body.
 *
 * ---
 *
 * ### 💡 Example
 * ```
 * POST /ankidb/query
 * Content-Type: application/json
 * Body: {
 *  userId: "a727c11b-caca-1e2d-acab-69420p1r1out"
 *  query: "select * from revlog WHERE id > ?"
 *  params: [1]
 * }
 * ```
 * ---
 *
 * ### ⚠️ Behavior
 * - If the file exists: returns response as JSON
 * - If not: returns a 404 with an error message
 */
export const queryRoute = new Elysia({
  name: "execute-anki-query",
}).post(
  "/query",
  async ({ body, set }) => {
    const { userId, query, queryParams } = body;

    const filePath = getDBPath(userId);

    if (!existsSync(filePath)) {
      set.status = 404;
      return { error: "Database not found" };
    }

    try {
      set.status = 200;
      const rows = await executeQuery(filePath, query, queryParams);
      return { message: "Query successful", response: rows };
    } catch (e: any) {
      set.status = 400;
      return { error: e.message };
    }
  },
  {
    body: t.Object({
      userId: t.String({ format: "uuid" }), // userId should be a valid UUID
      query: t.String(), // valid sql query
      queryParams: t.Optional(t.Array(t.Any())), // params are array of any type
    }),
    detail: {
      tags: ["Database"],
      summary: "Fetch data from a user's anki database",
      description:
        "Run server-side SELECT sql queries against the user's database. For other queries, use the `modify` endpoint.",
      responses: {
        200: { description: "Query successful, returns response as JSON" },
        404: { description: "Database not found on disk" },
      },
    },
  }
);
