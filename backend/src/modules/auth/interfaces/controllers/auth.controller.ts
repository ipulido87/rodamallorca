import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prisma from '../../../../lib/prisma'
import { sanitizeUser } from '../../../../utils/sanitize-user'
import { loginUser } from '../../application/login-user'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'
import { saveUser } from '../../infrastructure/services/user.service'
import { RegisterUserSchema } from '../http/schemas/register.schema'

export const registerUser = async (req: Request, res: Response) => {
  const result = RegisterUserSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues })
  }

  const { email, password } = result.data

  try {
    const user = await saveUser(email, password)

    await sendVerificationEmail(user.email, user.verificationCode!)
    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user),
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ message: 'El email ya está registrado' })
    }
    console.error('[RegisterUser Error]', error)

    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const loginUserController = async (req: Request, res: Response) => {
  const result = RegisterUserSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues })
  }

  const { email, password } = result.data

  try {
    const { token, user } = await loginUser(email, password)
    res.json({ token, user })
  } catch (err) {
    res.status(401).json({ error: 'Invalid email or password' })
  }
}

export const verifyUser = async (req: Request, res: Response) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ message: 'Faltan datos para verificar' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.verificationCode !== code) {
    return res
      .status(400)
      .json({ message: 'Código inválido o usuario no encontrado' })
  }

  await prisma.user.update({
    where: { email },
    data: { verified: true, verificationCode: null, codeExpiresAt: null },
  })

  return res
    .status(200)
    .json({ message: '✅ Usuario verificado correctamente' })
}
