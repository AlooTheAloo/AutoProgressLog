import {Elysia, t} from "elysia";
import {CreateAndTrimDatabase, getDBPath} from "../../services/db";
import StorageHTTPClient from "../../services/anki/StorageHTTPClient";

/**
 * @module downloadRoute (apl-storage)
 *
 * ## 📤 Download User Database
 *
 * This route handles saving a user’s anki database to the local file system.
 * It expects a application/json body containing the ankiToken and the ankiUrl.
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
 * POST /download/abc-123
 * Content-Type: application/json
 * Body: { ankiToken: "your-anki-token", ankiUrl: "http}://localhost:8765" }
 * ```
 *
 * ---
 */
export const downloadRoute = new Elysia({name: "download-database"}).post(
    "/download/:userId",
    async ({params, body, set}) => {
        const {userId} = params;
        const {ankiToken, ankiUrl} = body;
        console.log(ankiToken, ankiUrl);
        const file = await new StorageHTTPClient(ankiToken, ankiUrl).downloadInitialDatabase();
        if (!file) {
            set.status = 500;
            return {error: "Failed to download the database from Anki servers"};
        }
        const filepath = getDBPath(userId);
        try {
            await CreateAndTrimDatabase(filepath, file);
            set.status = 200;
            return {message: "Database created successfully"};
        } catch (e: any) {
            set.status = 500;
            return {error: e.message};
        }
    },
    {
        body: t.Object({
            ankiToken: t.String({
                example: "your-anki-token",
                description: "Your Anki token for authentication",
            }),
            ankiUrl: t.String({
                example: "http://localhost:8765",
                description: "The URL of your AnkiConnect server",
            }),
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
            summary: "Download a user's database",
            description:
                "Download a database for the specified user ID from Anki servers. The database is saved as a .collection.anki2 file in the public/ankidb directory.",
            responses: {
                200: {
                    description: "Database downloaded successfully",
                },
                500: {
                    description: "Internal server error",
                },
            },
        },
    }
);
