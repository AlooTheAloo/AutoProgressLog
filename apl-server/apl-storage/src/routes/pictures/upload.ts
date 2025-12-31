import {Elysia, t} from "elysia";
import {rmSync} from "fs";
import {mkdir, writeFile} from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 6.7 * 1024 * 1024; // 6.7MB in bytes

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
 * Where `userId` is the id passed in the URL parameter.
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
 * 2. Writes file contents as a PNG using the user’s id as filename
 * 3. Responds with a success message
 */
export const uploadRoute = new Elysia({name: "upload-picture"}).post(
    "/upload/:userId",
    async ({params, body, set}) => {
        const {userId} = params;

        // Extract file from body
        const file = body.file;

        if (file.size > MAX_FILE_SIZE) {
            set.status = 413; // Payload Too Large
            return {description: "File size exceeds the 6.7MB limit"};
        }
        const buffer = new Uint8Array(await file.arrayBuffer());

        const ext = path.extname(file.name).toLowerCase(); // e.g., ".jpeg"

        const dirPath = path.resolve("./public", "pictures");

        const filePath = path.join(dirPath, `${userId}`);

        // Create the directory if it doesn't exist
        await mkdir(dirPath, {recursive: true});

        // Write the file to disk (overwrites if it already exists)
        await writeFile(filePath, buffer);

        set.status = 200;
        return {message: "Picture uploaded successfully"};
    },
    {
        body: t.Object({
            file: t.File(),
        }),
        params: t.Object({
            userId: t.Integer(),
        }),
        response: {
            200: t.Object({message: t.String()}),
            413: t.Object({description: t.String()}),
            415: t.Object({description: t.String()}),
            400: t.Object({description: t.String()}),
            500: t.Object({description: t.String()}),
        },
        detail: {
            tags: ["Pictures"],
            summary: "Upload a user picture",
            description:
                "Uploads a picture for the specified user ID. The picture is saved in the public/pictures directory.",
            responses: {
                200: {description: "Picture uploaded successfully"},
                413: {description: "File too large (max 6.7MB)"},
                415: {description: "Unsupported file type"},
                400: {description: "Invalid request"},
                500: {description: "Internal server error"},
            },
        },
    }
);
