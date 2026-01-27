/**
 * Interfaz del servicio de email para abstraer la implementación (Resend, SendGrid, etc.)
 */

export interface EmailService {
  /**
   * Envía un email de reseteo de contraseña
   */
  sendPasswordResetEmail(email: string, token: string): Promise<void>

  /**
   * Envía un email de bienvenida
   */
  sendWelcomeEmail(email: string, name: string): Promise<void>

  /**
   * Envía un email de verificación de cuenta
   */
  sendVerificationEmail(email: string, token: string): Promise<void>
}
