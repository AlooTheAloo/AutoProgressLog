import { Elysia, t } from "elysia";
import path from "path";
import { existsSync, createReadStream } from "fs";

/**
 * @module fetchRoute (apl-storage)
 *
 * ## 🖼️ Fetch User Picture
 *
 * This route allows you to retrieve a user's profile picture from the file system.
 * It is intended to be accessed via public links (e.g. `<img src="...">` in frontend apps).
 *
 * ---
 *
 * ### 🧠 Responsibility
 * - This route **does not require authentication**
 * - Returns the image directly as a **readable stream**
 * - Used when you access the saved picture using a URL like:
 * ```
 * http://apl-storage:2727/pictures/fetch/{userId}
 * ```
 *
 * ---
 *
 * ### 📂 Where does it look for files?
 * It checks for a file at:
 * ```
 * ./public/pictures/{userId}.png
 * ```
 * Where `{userId}` is the id of the user.
 *
 * ---
 *
 * ### 💡 Example
 * ```ts
 * const url = `/storage/pictures/fetch/${user.id}`
 * <img src={url} />
 * ```
 *
 * ---
 *
 * ### ⚠️ Behavior
 * - If the file exists: returns it as a stream (image/png)
 * - If not: returns a 404 with an error message
 */
export const fetchRoute = new Elysia({ name: "fetch-picture" }).get(
  "/fetch/:userId",
  ({ params, set }) => {
    const { userId } = params;

    const filePath = path.resolve("./public/pictures", `${userId}`);

    if (!filePath) {
      set.status = 404;
      return { error: "Picture not found" };
    }

    set.status = 200;
    set.headers["Content-Type"] = "image/*";
    return createReadStream(filePath);
  },
  {
    params: t.Object({
      userId: t.Integer(),
    }),
    detail: {
      tags: ["Pictures"],
      summary: "Fetch a user picture",
      description: "Returns the user profile picture as a PNG stream.",
      responses: {
        200: { description: "Picture stream returned (image/png)" },
        404: { description: "Picture not found on disk" },
      },
    },
  }
);
