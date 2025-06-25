import {Resend} from 'resend'

const apiKey = Bun.env.RESEND_API_KEY
const resend = new Resend(apiKey)

/**
 * Sends a magic link to the user's email address using an HTML template.
 *
 * @param email - The recipient's email address.
 * @param token - The token to embed in the link.
 */
export async function sendMagicLink(email: string, token: string) {
    const magicLink = `apl://auth?email=${encodeURIComponent(email)}&token=${token}`

    const htmlTemplate = await Bun.file('./src/templates/email.html').text()
    const css = await Bun.file('./src/templates/style/email.css').text()
    const htmlWithStyle = htmlTemplate
        .replaceAll('{{MAGIC_LINK}}', magicLink)
        .replace('{{STYLE}}', css)


    await resend.emails.send({
        from: 'no-reply@aplapp.dev',
        to: email,
        subject: 'Your Magic Login Link ✨',
        html: htmlWithStyle,
    })
}
