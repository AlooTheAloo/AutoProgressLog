import { Elysia, t } from "elysia";
import path from "path";
import { existsSync } from "fs";
import { CleanRevlog } from "../../services/db";

/**
 * @module cleanRoute (apl-storage)
 *
 * ## 🧹 Clean Old Revlogs
 *
 * This route deletes old entries from the `revlog` table of a user’s Anki database.
 */
export const cleanRoute = new Elysia({ name: "clean-revlog" }).post(
  "/clean/:userId",
  async ({ params, set }) => {
    const { userId } = params;

    const filePath = path.resolve(
      "./public/ankidb",
      `${userId}.collection.anki2`
    );

    if (!existsSync(filePath)) {
      set.status = 404;
      return { error: "Database not found" };
    }

    try {
      await CleanRevlog(filePath);
      set.status = 200;
      return { message: "Old revlog entries cleaned successfully" };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message };
    }
  },
  {
    params: t.Object({
      userId: t.String({ format: "uuid" }),
    }),
    response: t.Union([
      t.Object({ message: t.String() }),
      t.Object({ error: t.String() }),
    ]),
    detail: {
      tags: ["Database"],
      summary: "Clean revlog table",
      description:
        "Deletes entries older than 50 days from the revlog table in a user's database.",
      responses: {
        200: { description: "Old entries deleted" },
        404: { description: "Database not found" },
        500: { description: "SQLite error" },
      },
    },
  }
);
