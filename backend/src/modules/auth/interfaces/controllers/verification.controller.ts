import { Request, Response } from 'express'
import { asyncHandler } from '../../../../utils/async-handler'
import {
  BadRequestError,
  NotFoundError,
  AppError,
} from '../../../../lib/helpers/error.helpers'
import prisma from '../../../../lib/prisma'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'

export const resendVerificationController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { email } = req.body

  if (!email) {
    throw new BadRequestError('El email es requerido')
  }

  console.log('🔐 [RESEND_VERIFICATION] Solicitado para:', email)

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    console.log('❌ [RESEND_VERIFICATION] Usuario no encontrado:', email)
    throw new NotFoundError('Usuario')
  }

  if (user.verified) {
    console.log('❌ [RESEND_VERIFICATION] Usuario ya verificado:', email)
    throw new BadRequestError('El usuario ya está verificado')
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

    res.status(200).json({
      message:
        'Email de verificación reenviado. Revisa tu bandeja de entrada.',
    })
  } catch (emailError) {
    console.error(
      '❌ [RESEND_VERIFICATION] Error enviando email:',
      emailError
    )

    throw new AppError('Error al enviar el email de verificación', 500, 'EMAIL_SEND_FAILED')
  }
})
