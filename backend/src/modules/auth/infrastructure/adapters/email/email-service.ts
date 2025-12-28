import { Resend } from 'resend'

const { RESEND_API_KEY, EMAIL_FROM } = process.env

if (!RESEND_API_KEY) {
  console.error('[MAIL] ❌ Falta RESEND_API_KEY en .env')
}

const resend = new Resend(RESEND_API_KEY || '')

export const sendVerificationEmail = async (email: string, code: string) => {
  // ✅ SOLO LINK DIRECTO - NO CÓDIGO MANUAL
  const verifyUrl = `${
    process.env.BACKEND_URL || 'http://localhost:4000'
  }/api/auth/verify-link?email=${encodeURIComponent(email)}&code=${code}`

  try {
    console.log('[MAIL] Enviando email de verificación con Resend...')

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Verifica tu cuenta - RodaMallorca',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">🚴 RodaMallorca</h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">¡Bienvenido a RodaMallorca! 🎉</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Estamos emocionados de tenerte con nosotros. Para completar tu registro y activar tu cuenta, 
              solo tienes que hacer clic en el botón de abajo:
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${verifyUrl}" 
               style="background: #007bff; 
                      color: white; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-size: 18px; 
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,123,255,0.3);">
              ✅ Activar Mi Cuenta
            </a>
          </div>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.
            </p>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 13px; margin: 0;">
              Si no te registraste en RodaMallorca, puedes ignorar este mensaje de forma segura.
            </p>
            <p style="color: #999; font-size: 13px; margin-top: 10px;">
              Si tienes problemas con el botón, copia y pega este enlace en tu navegador:<br>
              <a href="${verifyUrl}" style="color: #007bff; word-break: break-all;">${verifyUrl}</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 RodaMallorca - Tu marketplace de confianza para bicicletas
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[MAIL] ❌ Error de Resend:', error)
      throw error
    }

    console.log('[MAIL] ✅ Email de verificación enviado:', data?.id)
  } catch (err) {
    console.error('[MAIL] ❌ Error enviando correo:', err)
    throw err
  }
}
