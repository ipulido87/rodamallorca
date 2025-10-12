// backend/src/modules/auth/application/reset-password.ts
import bcrypt from 'bcrypt'
import { PasswordResetToken } from '../domain/entities/password-reset-token'
import { PasswordResetRepository } from '../domain/repositories/password-reset-repository'

interface ResetPasswordInput {
  token: string
  newPassword: string
}

interface ResetPasswordDeps {
  repo: PasswordResetRepository
}

export class ResetPasswordUseCase {
  constructor(private deps: ResetPasswordDeps) {}

  async execute(input: ResetPasswordInput): Promise<{ message: string }> {
    const { token, newPassword } = input

    // Buscar token
    const resetData = await this.deps.repo.findByToken(token)

    console.log('🔍 [RESET] Token recibido:', token)
    console.log('🔍 [RESET] Nueva contraseña recibida:', newPassword)

    if (!resetData) {
      throw new Error('Token inválido o expirado')
    }

    console.log('✅ [RESET] Usuario encontrado:', resetData.email)

    // Validar expiración
    const resetToken = PasswordResetToken.fromPersistence(
      token,
      resetData.expiresAt
    )

    if (!resetToken.isValid()) {
      // Limpiar token expirado
      await this.deps.repo.deleteResetToken(resetData.email)
      throw new Error('Token inválido o expirado')
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10)

    console.log(
      '🔐 [RESET] Password hasheado:',
      passwordHash.substring(0, 20) + '...'
    )

    // Actualizar contraseña y eliminar token
    await this.deps.repo.updatePassword(resetData.email, passwordHash)
    console.log('✅ [RESET] Password actualizado en BD para:', resetData.email)

    return {
      message: 'Contraseña actualizada correctamente',
    }
  }
}
