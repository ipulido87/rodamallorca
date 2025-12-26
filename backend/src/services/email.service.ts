import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    // ✅ En desarrollo, usar Mailtrap (como ahora)
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Email que se enviaría:', { to, subject })
      console.log('📧 [DEV] Verifica en Mailtrap')
      return { success: true, messageId: 'dev-mode' }
    }

    // ✅ En producción, usar Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Roda Mallorca <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('❌ Error enviando email:', error)
      throw new Error(`Email error: ${error.message}`)
    }

    console.log('✅ Email enviado:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('❌ Error en sendEmail:', error)
    throw error
  }
}

// ✅ Template para email de verificación
export function getVerificationEmailHtml(code: string, userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verifica tu cuenta - Roda Mallorca</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🚴 Roda Mallorca</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333;">¡Hola ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Gracias por registrarte en Roda Mallorca. Para completar tu registro,
            por favor usa el siguiente código de verificación:
          </p>
          <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 8px;">
              ${code}
            </div>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Este código expirará en 15 minutos.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Si no solicitaste este código, puedes ignorar este email.
          </p>
        </div>
      </body>
    </html>
  `
}
