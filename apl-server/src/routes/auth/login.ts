import {Elysia, t} from "elysia";
import {createEmailToken} from "../../services/auth/token";
import prisma from "../../db/client";
import {sendMagicLink} from "../../services/email/sendMagicLink";

/**
 * ## POST /login
 *
 * This endpoint handles **passwordless login** via email.
 * It will:
 * - ✅ Find or create a user by their email address
 * - ✅ Generate a unique email login token
 * - ✅ Send that token in a **magic link** email
 *
 * ---
 *
 * ### 🔓 Public Access
 * No authentication is required — this is how the user begins the login process.
 *
 * ---
 *
 * ### 🧠 Step-by-step logic:
 * 1. Accepts a `POST` request with `{ email }` in the body
 * 2. Checks if a user already exists with that email
 *    - If not, creates a new user record
 *    - If yes, just proceeds
 * 3. Generates a secure token linked to the user's ID
 * 4. Sends an email containing a magic link (login URL with token)
 * 5. Responds with empty 204 (no content), or 201 if user was just created
 *
 * ---
 *
 * ### ⚠️ Security Considerations
 * - Always returns success regardless of whether the email exists
 *   to avoid leaking user existence.
 *
 * ---
 *
 * ### 📦 Request Format:
 * ```json
 * {
 *   "email": "youssef@youssef.dev"
 * }
 * ```
 *
 * ---
 *
 * ### 🧪 Example usage with Eden:
 * ```ts
 * import { eden } from '@elysiajs/eden';
 * import type { APLServer } from '~/server';
 *
 * const api = eden<typeof APLServer>('https://api.autoprogresslog.com');
 *
 * await api.auth.login({ email: 'youssef@youssef.dev' });
 * // User receives a magic link in their inbox
 * ```
 */
export const loginRoute = new Elysia({name: "login"}).post(
    '/login',
    async ({body, set}) => {
        const {email} = body;

        // Check if a user exists with this email
        let user = await prisma.user.findUnique({where: {email}});

        // If user doesn't exist, create them
        if (!user) {
            user = await prisma.user.create({data: {email}});
            set.status = "Created"; // sets HTTP 201 Created
        }

        // Generate email-based login token
        const token = await createEmailToken(user.id);

        // Send the magic login link to the email
        await sendMagicLink(email, token);

        // Response: nothing, just success
        return;
    },
    {
        body: t.Object({
            email: t.String({
                format: 'email',
                example: 'youssef@youssef.dev',
            }),
        }),
        response: t.Void(),
        detail: {
            summary: 'Login',
            tags: ['Auth'],
            description: 'Starts the passwordless login process by sending a magic link to the user\'s email address.',
        }
    }
);
