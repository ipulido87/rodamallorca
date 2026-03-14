import { EmailService } from '../../../domain/services/email-service'
import { sendPasswordResetEmail as sendPasswordResetEmailImpl } from './password-reset-email'

/**
 * Implementación del servicio de email usando el provider existente
 */
export class EmailServiceImpl implements EmailService {
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await sendPasswordResetEmailImpl(email, token)
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // TODO: Implementar cuando sea necesario
    console.log(`📧 [EMAIL] Welcome email to ${email} (${name}) - Not implemented yet`)
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // TODO: Implementar cuando sea necesario
    console.log(`📧 [EMAIL] Verification email to ${email} - Not implemented yet`)
  }
}
