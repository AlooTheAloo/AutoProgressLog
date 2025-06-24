import {Resend} from "resend";

const apiKey = Bun.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

/**
 * Sends a magic link to the user's email address for authentication.
 *
 * @param {string} email - The email address to send the magic link to.
 * @param {string} token - The magic link token to be included in the email.
 */

export async function sendMagicLink(email: string, token:string){
    
}

