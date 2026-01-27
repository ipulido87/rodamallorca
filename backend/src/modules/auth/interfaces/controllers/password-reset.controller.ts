// backend/src/modules/auth/interfaces/controllers/password-reset.controller.ts
import { Request, Response } from 'express'
import { ForgotPasswordUseCase } from '../../application/forgot-password'
import { ResetPasswordUseCase } from '../../application/reset-password'
import { PasswordResetRepositoryPrisma } from '../../infrastructure/persistence/prisma/password-reset-repository-prisma'
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/user-repository-prisma'
import { EmailServiceImpl } from '../../infrastructure/adapters/email/email-service-impl'
import { type ForgotPasswordInput } from '../http/schemas/forgot-password.schema'
import { type ResetPasswordInput } from '../http/schemas/reset-password.schema'

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    // Validación ya realizada por middleware validateBody
    const input: ForgotPasswordInput = req.body

    // Ejecutar use case con todas las dependencias
    const repo = new PasswordResetRepositoryPrisma()
    const userRepo = new UserRepositoryPrisma()
    const emailService = new EmailServiceImpl()
    const useCase = new ForgotPasswordUseCase({ repo, userRepo, emailService })
    const response = await useCase.execute(input)

    return res.status(200).json(response)
  } catch (error) {
    console.error('[FORGOT_PASSWORD_CONTROLLER] Error:', error)
    return res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
}

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    // Validación ya realizada por middleware validateBody
    const input: ResetPasswordInput = req.body

    // Ejecutar use case
    const repo = new PasswordResetRepositoryPrisma()
    const useCase = new ResetPasswordUseCase({ repo })
    const response = await useCase.execute(input)

    return res.status(200).json(response)
  } catch (error) {
    const err = error as Error
    console.error('[RESET_PASSWORD_CONTROLLER] Error:', err)

    if (err.message === 'Token inválido o expirado') {
      return res.status(400).json({ message: err.message })
    }

    return res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
}
