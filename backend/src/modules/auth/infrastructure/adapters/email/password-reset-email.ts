import nodemailer from 'nodemailer'

const { MAILTRAP_USER, MAILTRAP_PASS } = process.env

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: MAILTRAP_USER || '',
    pass: MAILTRAP_PASS || '',
  },
})

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`

  try {
    await transporter.verify()
    console.log('[MAIL] SMTP listo ✅')

    const info = await transporter.sendMail({
      from: 'no-reply@rodamallorca.com',
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

    console.log('[MAIL] Email de reset enviado OK:', info.messageId)
  } catch (err) {
    console.error('[MAIL] Error enviando email de reset:', err)
    throw err
  }
}
