import { Request, Response } from 'express'
import prisma from '../../../../lib/prisma'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'

export const resendVerificationController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      error: 'EMAIL_REQUIRED',
      message: 'El email es requerido',
    })
  }

  try {
    console.log('🔐 [RESEND_VERIFICATION] Solicitado para:', email)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      console.log('❌ [RESEND_VERIFICATION] Usuario no encontrado:', email)
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      })
    }

    if (user.verified) {
      console.log('❌ [RESEND_VERIFICATION] Usuario ya verificado:', email)
      return res.status(400).json({
        error: 'ALREADY_VERIFIED',
        message: 'El usuario ya está verificado',
      })
    }

    // ✅ GENERAR NUEVO CÓDIGO (más robusto)
    const verificationCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
    const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    console.log(
      '✅ [RESEND_VERIFICATION] Nuevo código generado:',
      verificationCode
    )

    // Actualizar en base de datos
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        verificationCode,
        codeExpiresAt,
      },
    })

    console.log('✅ [RESEND_VERIFICATION] Código guardado en BD')

    // ✅ ENVIAR EMAIL
    try {
      await sendVerificationEmail(email, verificationCode)
      console.log(
        '✅ [RESEND_VERIFICATION] Email enviado exitosamente a:',
        email
      )

      return res.status(200).json({
        message:
          'Email de verificación reenviado. Revisa tu bandeja de entrada.',
      })
    } catch (emailError) {
      console.error(
        '❌ [RESEND_VERIFICATION] Error enviando email:',
        emailError
      )

      return res.status(500).json({
        error: 'EMAIL_SEND_FAILED',
        message: 'Error al enviar el email de verificación',
      })
    }
  } catch (error) {
    console.error('❌ [RESEND_VERIFICATION] Error general:', error)
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error al procesar la solicitud',
    })
  }
}
