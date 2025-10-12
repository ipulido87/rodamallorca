// backend/src/modules/auth/interfaces/controllers/password-reset.controller.ts
import { Request, Response } from 'express'
import { ForgotPasswordUseCase } from '../../application/forgot-password'
import { ResetPasswordUseCase } from '../../application/reset-password'
import { PasswordResetRepositoryPrisma } from '../../infrastructure/persistence/prisma/password-reset-repository-prisma'
import {
  ForgotPasswordSchema,
  type ForgotPasswordInput,
} from '../http/schemas/forgot-password.schema'
import {
  ResetPasswordSchema,
  type ResetPasswordInput,
} from '../http/schemas/reset-password.schema'

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    // Validar input
    const result = ForgotPasswordSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues })
    }

    const input: ForgotPasswordInput = result.data

    // Ejecutar use case
    const repo = new PasswordResetRepositoryPrisma()
    const useCase = new ForgotPasswordUseCase({ repo })
    const response = await useCase.execute(input)

    return res.status(200).json(response)
  } catch (error) {
    console.error('[FORGOT_PASSWORD_CONTROLLER] Error:', error)
    return res.status(500).json({ message: 'Error al procesar la solicitud' })
  }
}

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    // Validar input
    const result = ResetPasswordSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues })
    }

    const input: ResetPasswordInput = result.data

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
