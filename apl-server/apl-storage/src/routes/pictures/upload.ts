import { Elysia, t } from "elysia";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * @module uploadRoute (apl-storage)
 *
 * ## 📤 Upload User Picture
 *
 * This route handles saving a user’s profile picture to the local file system.
 * It expects a multipart/form-data body containing a single file field named `file`.
 *
 * ---
 *
 * ### 🧠 Responsibility
 * - This route is intended to be used by `apl-server` as a reverse proxy.
 * - The actual file gets stored **physically** on disk, NOT in the database.
 * - Auth should NOT be handled here — access must be managed by `apl-server`.
 *
 * ---
 *
 * ### 📁 Where does it save the picture?
 * The picture is saved in:
 * ```
 * ./public/pictures/{userId}.png
 * ```
 * Where `userId` is the UUID passed in the URL.
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
export const uploadRoute = new Elysia({ name: "upload-picture" }).post(
  "/upload/:userId",
  async ({ params, body, set }) => {
    const { userId } = params;

    // Extract file from body
    const file = body.file;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const ext = path.extname(file.name).toLowerCase(); // e.g., ".jpeg"
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext)
      ? ext
      : ".png"; // fallback

    const dirPath = path.resolve("./public", "pictures");
    const filePath = path.join(dirPath, `${userId}${safeExt}`);

    // Create the directory if it doesn't exist
    await mkdir(dirPath, { recursive: true });

    // Write the file to disk (overwrites if it already exists)
    await writeFile(filePath, buffer);

    set.status = 200;
    return { message: "Picture uploaded successfully" };
  },
  {
    body: t.Object({
      file: t.File(),
    }),
    params: t.Object({
      userId: t.String({ format: "uuid" }),
    }),
    response: t.Object({
      message: t.String(),
    }),
    detail: {
      tags: ["Pictures"],
      summary: "Upload a user picture",
      description:
        "Uploads a picture for the specified user ID. The picture is saved as a PNG file in the public/pictures directory.",
      responses: {
        200: {
          description: "Picture uploaded successfully",
        },
        400: {
          description: "Invalid request",
        },
        500: {
          description: "Internal server error",
        },
      },
    },
  }
);
