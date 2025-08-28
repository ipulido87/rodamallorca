import { Request, Response } from 'express'
import prisma from '../../../../lib/prisma'
import { sanitizeUser } from '../../../../utils/sanitize-user'
import { loginUser } from '../../application/login-user'
import { registerUserUseCase } from '../../application/register-user'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'
import { LoginUserSchema } from '../http/schemas/login.schema'
import { RegisterUserSchema } from '../http/schemas/register.schema'

export const registerUser = async (req: Request, res: Response) => {
  const parsed = RegisterUserSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues })
  }
  const { email, password, name, birthDate, phone } = parsed.data

  try {
    const user = await registerUserUseCase({
      email,
      password,
      name,
      birthDate,
      phone,
    })

    try {
      await sendVerificationEmail(user.email, user.verificationCode!)
    } catch (e) {
      // no bloquees el registro por fallo de email; log y responde con aviso
      console.warn('[sendVerificationEmail] failed:', e)
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user),
    })
  } catch (err: any) {
    // Prisma P2002 (unique violation) — puede ser email o phone
    if (err?.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'Email or phone already registered' })
    }
    console.error('[RegisterUser Error]', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const loginUserController = async (req: Request, res: Response) => {
  const result = LoginUserSchema.safeParse(req.body) // <-- antes usabas RegisterUserSchema

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues })
  }

  const { email, password } = result.data

  try {
    const { token, user } = await loginUser(email, password)
    res.json({ token, user })
  } catch {
    res.status(401).json({ error: 'Invalid email or password' })
  }
}

export const verifyUser = async (req: Request, res: Response) => {
  const emailRaw = req.body?.email
  const code = req.body?.code

  if (!emailRaw || !code) {
    return res.status(400).json({ message: 'missed data for verify' })
  }

  const email = String(emailRaw).trim().toLowerCase()
  const now = new Date()

  const result = await prisma.user.updateMany({
    where: {
      email,
      verificationCode: code,
      verified: false,
      OR: [{ codeExpiresAt: null }, { codeExpiresAt: { gt: now } }],
    },
    data: { verified: true, verificationCode: null, codeExpiresAt: null },
  })

  if (result.count === 0) {
    return res
      .status(400)
      .json({ message: 'Código inválido, expirado o usuario ya verificado' })
  }

  return res
    .status(200)
    .json({ message: '✅ Usuario verificado correctamente' })
}
