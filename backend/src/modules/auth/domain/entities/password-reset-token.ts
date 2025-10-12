import { randomBytes } from 'crypto'

export class PasswordResetToken {
  private constructor(
    public readonly token: string,
    public readonly expiresAt: Date
  ) {}

  static create(expirationMinutes: number = 60): PasswordResetToken {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000)
    return new PasswordResetToken(token, expiresAt)
  }

  static fromPersistence(token: string, expiresAt: Date): PasswordResetToken {
    return new PasswordResetToken(token, expiresAt)
  }

  isExpired(): boolean {
    return this.expiresAt < new Date()
  }

  isValid(): boolean {
    return !this.isExpired()
  }
}
