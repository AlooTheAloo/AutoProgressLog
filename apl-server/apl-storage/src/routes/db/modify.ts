import { Elysia, t } from "elysia";
import { existsSync } from "fs";
import { executeModification, getDBPath } from "../../services/db";

/**
 * @module modifyRoute (apl-storage)
 *
 * ## 📊 Execute User Database modification
 * This route allows you to execute a database modification (INSERT, UPDATE, DELETE).
 * It will be ran against the specified user's database and return the last ID of the modified table as an integer.
 * Available Tables : `cards`, `col`, `decks`, `revlog`. Additional info can be found in the apl-storage documentation.
 * ---
 * ### 🧠 Responsibility
 * - This route **does not require authentication**
 * - Returns the response as a JSON array
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
 * POST /ankidb/modify
 * Content-Type: application/json
 * Body: {
 *  userId: "a727c11b-caca-1e2d-acab-69420p1r1out"
 *  query: "INSERT INTO revlog (id, cid, usn, ease, ivl, lastUsn, factor, time, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
 *  params: [7, 2, 7, 2, 7, 2, 7, 2, 7]
 * }
 * ```
 * ---
 *
 * ### ⚠️ Behavior
 * - If the file exists and was modified: returns response as JSON
 * - If the file exists but there was an error: returns a 400 with an error message
 * - If not: returns a 404 with an error message
 */
export const modifyRoute = new Elysia({
  name: "execute-anki-modification",
}).patch(
  "/modify",
  async ({ body, set }) => {
    const { userId, query, queryParams } = body;

    const filePath = getDBPath(userId);

    if (!existsSync(filePath)) {
      set.status = 404;
      return { error: "Database not found" };
    }

    let lastID: number | bigint;
    try {
      lastID = await executeModification(filePath, query, queryParams);
      set.status = 201;
      return { message: "Modification successful", lastID: lastID };
    } catch (e: any) {
      set.status = 400;
      return { error: e.message };
    }
  },
  {
    body: t.Object({
      userId: t.Integer(), // userId should be a valid UUID
      query: t.String(), // valid sql query
      queryParams: t.Optional(t.Array(t.Any())), // params are array of any type
    }),
    detail: {
      tags: ["Database"],
      summary: "Modify a user database",
      description:
        "Run server-side modicication sql queries against the user's database. Only supports `INSERT`, `UPDATE`, and `DELETE` queries. For SELECT, use the `query` endpoint.",
      responses: {
        200: {
          description: "Modification successful, returns last modified ID. ",
        },
        400: {
          description: "Invalid query or parameters / internal server error",
        },
        404: { description: "Database not found on disk" },
      },
    },
  }
);
