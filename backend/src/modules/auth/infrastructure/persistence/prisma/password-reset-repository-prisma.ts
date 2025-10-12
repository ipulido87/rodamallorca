import prisma from '../../../../../lib/prisma'
import { PasswordResetToken } from '../../../domain/entities/password-reset-token'
import { PasswordResetRepository } from '../../../domain/repositories/password-reset-repository'

export class PasswordResetRepositoryPrisma implements PasswordResetRepository {
  async saveResetToken(
    email: string,
    token: PasswordResetToken
  ): Promise<void> {
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        resetToken: token.token,
        resetTokenExpiresAt: token.expiresAt,
      },
    })
  }

  async findByToken(
    token: string
  ): Promise<{ email: string; expiresAt: Date } | null> {
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
      select: { email: true, resetTokenExpiresAt: true },
    })

    if (!user || !user.resetTokenExpiresAt) return null

    return {
      email: user.email,
      expiresAt: user.resetTokenExpiresAt,
    }
  }

  async deleteResetToken(email: string): Promise<void> {
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })
  }

  async updatePassword(email: string, newPasswordHash: string): Promise<void> {
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        password: newPasswordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    })
  }
}
