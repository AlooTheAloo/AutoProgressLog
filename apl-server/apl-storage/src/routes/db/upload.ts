import { Elysia, t } from "elysia";
import path from "path";
import { CreateAndTrimDatabase, getDBPath } from "../../services/db";

/**
 * @module uploadRoute (apl-storage)
 *
 * ## 📤 Upload User Database
 *
 * This route handles saving a user’s anki database to the local file system.
 * It expects a multipart/form-data body containing a single file field named `file`.
 *
 * ---
 *
 * ### 🧠 Responsibility
 * - This route is intended to be used by `apl-server` as a reverse proxy.
 * - The actual file gets stored **physically** on disk.
 * - Auth should NOT be handled here — access must be managed by `apl-server`.
 *
 * ---
 *
 * ### 📁 Where does it save the database?
 * The database is saved in:
 * ```
 * ./public/ankidb/{userId}.collection.anki2
 * ```
 * Where `userId` is the user ID passed in the URL.
 *
 * ---
 *
 * ### 📥 Example request
 * ```
 * POST /upload/abc-123
 * Content-Type: multipart/form-data
 * Body: { file: <File> }
 * ```
 *
 * ---
 *
 * ### ✅ Behavior
 * 1. Ensures `public/pictures` exists (creates it if necessary)
 * 2. Writes file contents as a PNG using the user’s UUID as filename
 * 3. Responds with a success message
 */
export const uploadRoute = new Elysia({ name: "upload-database" }).post(
  "/upload/:userId",
  async ({ params, body, set }) => {
    const { userId } = params;

    // Extract file from body
    const file = body.file;
    const filepath = getDBPath(userId);
    try {
      await CreateAndTrimDatabase(filepath, file);
      set.status = 200;
      return { message: "Database created successfully" };
    } catch (e: any) {
      set.status = 500;
      return { error: e.message };
    }
  },
  {
    body: t.Object({
      file: t.File(),
    }),
    params: t.Object({
      userId: t.Integer(),
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
      summary: "Upload a user database",
      description:
        "Uploads a database for the specified user ID. The database is saved as a .collection.anki2 file in the public/ankidb directory.",
      responses: {
        200: {
          description: "Database uploaded successfully",
        },
        500: {
          description: "Internal server error",
        },
      },
    },
  }
);
