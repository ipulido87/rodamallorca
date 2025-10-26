import nodemailer from 'nodemailer'

const { MAILTRAP_USER, MAILTRAP_PASS } = process.env

if (!MAILTRAP_USER || !MAILTRAP_PASS) {
  console.error('[MAIL] ❌ Faltan MAILTRAP_USER o MAILTRAP_PASS en .env')
}

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: MAILTRAP_USER || '',
    pass: MAILTRAP_PASS || '',
  },
})

export const sendVerificationEmail = async (email: string, code: string) => {
  // ✅ MEJORAR LA URL - usar FRONTEND_URL en lugar de BACKEND
  const verifyUrl = `${
    process.env.FRONTEND_URL || 'http://localhost:5173'
  }/verify?email=${encodeURIComponent(email)}&code=${code}`

  try {
    console.log('📧 [MAIL] Verificando conexión SMTP...')
    await transporter.verify()
    console.log('📧 [MAIL] SMTP listo ✅')

    console.log(`📧 [MAIL] Enviando email a: ${email}`)
    console.log(`📧 [MAIL] Código de verificación: ${code}`)

    const info = await transporter.sendMail({
      from: '"RodaMallorca" <no-reply@rodamallorca.com>',
      to: email,
      subject: 'Verifica tu cuenta - RodaMallorca',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verifica tu cuenta en RodaMallorca</h2>
          <p>Hola,</p>
          <p>Para completar tu registro, por favor verifica tu cuenta usando el siguiente código:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>O haz clic en el siguiente enlace:</p>
          <a href="${verifyUrl}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar mi cuenta
          </a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Si no solicitaste este código, puedes ignorar este mensaje.
          </p>
        </div>
      `,
    })

    console.log('✅ [MAIL] Email enviado exitosamente')
    console.log('📧 [MAIL] Message ID:', info.messageId)

    return info
  } catch (err) {
    console.error('❌ [MAIL] Error enviando correo:', err)
    throw err
  }
}
