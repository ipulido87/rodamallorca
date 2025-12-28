import { Resend } from 'resend'

const { RESEND_API_KEY, EMAIL_FROM } = process.env

if (!RESEND_API_KEY) {
  console.error('[MAIL] ❌ Falta RESEND_API_KEY en .env')
}

const resend = new Resend(RESEND_API_KEY || '')

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`

  try {
    console.log('[MAIL] Enviando email de reset de contraseña con Resend...')

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Restablecer contraseña - RodaMallorca',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Restablecer contraseña</h2>
          <p>Has solicitado restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Restablecer contraseña
          </a>
          <p style="color: #666; font-size: 14px;">
            Este enlace expirará en 1 hora.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no solicitaste restablecer tu contraseña, ignora este email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[MAIL] ❌ Error de Resend:', error)
      throw error
    }

    console.log('[MAIL] ✅ Email de reset enviado:', data?.id)
  } catch (err) {
    console.error('[MAIL] ❌ Error enviando email de reset:', err)
    throw err
  }
}
