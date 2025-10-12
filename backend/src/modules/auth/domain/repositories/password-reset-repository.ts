import { PasswordResetToken } from '../entities/password-reset-token'

export interface PasswordResetRepository {
  saveResetToken(email: string, token: PasswordResetToken): Promise<void>
  findByToken(token: string): Promise<{ email: string; expiresAt: Date } | null>
  deleteResetToken(email: string): Promise<void>
  updatePassword(email: string, newPasswordHash: string): Promise<void>
}
