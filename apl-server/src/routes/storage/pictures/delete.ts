import { Elysia, t } from "elysia";
import { authGuard, authHeaders } from "../../../middlewares/authGuard";
import client from "../../../db/client";

/**
 * ## DELETE /storage/pictures/delete
 *
 * This endpoint allows an authenticated user to delete their **profile picture**.
 *
 * It does 2 main things:
 *
 * 1. It tells the **storage server** (`apl-storage`) to physically delete the user's picture file from disk.
 * 2. It updates the **database record** of the user in the main server (`apl-server`) to remove the picture URL.
 *
 * ---
 *
 * ### 🔒 Authentication
 * This route is protected with `authGuard`, so only logged-in users can access it.
 * The `user` object is automatically injected and represents the authenticated user.
 *
 * ---
 *
 * ### 🧠 How it works (step-by-step)
 *
 * 1. The route listens to **DELETE** requests sent to `/delete`.
 * 2. It gets the `user.id` from the `user` object (thanks to `authGuard`).
 * 3. It sends an internal **DELETE** request to the storage microservice:
 *    - URL: `http://apl-storage:2727/pictures/delete/:userId`
 *    - That microservice will delete the picture file from the server filesystem.
 * 4. If that works (`res.ok`), it updates the database:
 *    - It sets the user’s `profilePicture` field in the database to `null`.
 *    - That means the user no longer has a profile picture saved.
 * 5. The route finally returns a JSON response confirming success:
 *    - `{ message: "Picture deleted successfully" }`
 * 6. If something goes wrong (e.g. storage server failed), it returns an error and a proper HTTP status code.
 *
 * ---
 *
 * ### 📦 Expected Client Response
 * - ✅ 200 OK: `{ message: "Picture deleted successfully" }`
 * - ❌ 404 Not Found / 500 Internal Server Error if deletion fails
 *
 * ---
 *
 * ### ⚠️ Note
 * - This route does **not** return the updated user object.
 * - It silently logs any DB error to the console, but doesn’t crash the server.
 */
export const deleteRoute = new Elysia({ name: 'delete-route' })
    .use(authGuard)
    .delete('/delete',
        async ({ user, set }) => {
            // Step 1: Send DELETE request to apl-storage to remove the picture file
            const res = await fetch(`http://apl-storage:2727/pictures/delete/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Step 2: If storage failed, return the error and status
            if (!res.ok) {
                set.status = res.status;
                return { error: 'Failed to delete picture' };
            }

            // Step 3: Update the user in the database and remove the profilePicture link
            await client.user.update({
                where: { id: user.id },
                data: { profilePicture: null }
            }).catch(err => {
                console.error('Failed to update user picture URL:', err);
            });

            // Step 4: Return success message
            return await res.json();
        },
        {
            headers: authHeaders,
            response: t.Object({
                message: t.String({ description: 'Success message' })
            }),
            detail: {
                tags: ['Storage'],
                summary: 'Delete a picture',
                description: `Deletes a user's profile picture from the storage service and updates their database record.`
            }
        }
    );
