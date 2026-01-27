import { PasswordResetToken } from '../domain/entities/password-reset-token'
import { PasswordResetRepository } from '../domain/repositories/password-reset-repository'
import { UserRepository } from '../domain/repositories/user-repository'
import { EmailService } from '../domain/services/email-service'

interface ForgotPasswordInput {
  email: string
}

interface ForgotPasswordDeps {
  repo: PasswordResetRepository
  userRepo: UserRepository
  emailService: EmailService
}

export class ForgotPasswordUseCase {
  constructor(private deps: ForgotPasswordDeps) {}

  async execute(input: ForgotPasswordInput): Promise<{ message: string }> {
    const emailNorm = input.email.trim().toLowerCase()

    // Verificar si el usuario existe usando repositorio
    const user = await this.deps.userRepo.findByEmail(emailNorm)

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

    // Enviar email usando servicio inyectado
    try {
      await this.deps.emailService.sendPasswordResetEmail(user.email, resetToken.token)
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
