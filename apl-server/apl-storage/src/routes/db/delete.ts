import { Elysia, t } from "elysia";
import path from "path";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { getDBPath } from "../../services/db";

/**
 * @module deleteRoute (apl-storage)
 *
 * ## 🗑 Delete Database Endpoint
 *
 * This route handles deletion of a user’s database file (.collection.anki2) from the file system.
 * It assumes each user’s database is stored under:
 *
 * 📁 `./public/ankidb/{userId}.collection.anki2`
 *
 * ---
 *
 * ### 🧠 Responsibility
 * - This route is used internally by `apl-server`, typically as a reverse proxy call.
 * - It directly interacts with the filesystem.
 *
 * ---
 *
 * ### 📥 Expected input
 * - `userId` in the URL path
 *
 * ---
 *
 * ### 🔄 Behavior
 * - Checks if the file exists
 * - If not found, returns 404
 * - If found, deletes the file, returns 200
 */
export const deleteRoute = new Elysia({ name: "delete-database" }).delete(
  "/delete/",
  async ({ params, set }) => {
    const { userId } = params;

    // Construct absolute path to the user's picture
    const filePath = getDBPath(userId);

    // If the file does not exist, return 404
    if (!existsSync(filePath)) {
      set.status = 404;
      return { error: "Database not found" };
    }

    // Delete the file from the filesystem
    await unlink(filePath);

    return { message: "Database deleted successfully" };
  },
  {
    params: t.Object({
      userId: t.String({ format: "uuid" }),
    }),
    response: t.Union([
      t.Object({
        message: t.String(),
      }),
      t.Object({
        error: t.String(),
      }),
    ]),
    detail: {
      tags: ["Database"],
      summary: "Delete a user's database",
      description: `Deletes a user's database file (.collection.anki2) from the storage server.
This does **not** require auth in apl-storage but should be reverse-proxied by apl-server for access control.`,
      responses: {
        200: { description: "Database deleted successfully" },
        404: { description: "Database not found" },
      },
    },
  }
);
