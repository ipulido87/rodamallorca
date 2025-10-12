import prisma from '../../../lib/prisma'
import { PasswordResetToken } from '../domain/entities/password-reset-token'
import { PasswordResetRepository } from '../domain/repositories/password-reset-repository'
import { sendPasswordResetEmail } from '../infrastructure/adapters/email/password-reset-email'

interface ForgotPasswordInput {
  email: string
}

interface ForgotPasswordDeps {
  repo: PasswordResetRepository
}

export class ForgotPasswordUseCase {
  constructor(private deps: ForgotPasswordDeps) {}

  async execute(input: ForgotPasswordInput): Promise<{ message: string }> {
    const emailNorm = input.email.trim().toLowerCase()

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
    })

    if (!user) {
      return {
        message:
          'Si el email está registrado, recibirás un enlace de recuperación',
      }
    }

    // Generar token
    const resetToken = PasswordResetToken.create(60) // 60 minutos

    // Guardar token
    await this.deps.repo.saveResetToken(emailNorm, resetToken)

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, resetToken.token)
    } catch (error) {
      console.error('[FORGOT_PASSWORD] Error sending email:', error)
      // No fallar si el email no se envía, solo logear
    }

    return {
      message:
        'Si el email está registrado, recibirás un enlace de recuperación',
    }
  }
}
