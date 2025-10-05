import crypto from 'crypto'
import { Request, Response } from 'express'
import { verify as jwtVerify } from 'jsonwebtoken'
import prisma from '../../../../lib/prisma'
import { sanitizeUser } from '../../../../utils/sanitize-user'
import { loginUser } from '../../application/login-user'
import { loginWithGoogleUseCase } from '../../application/login-with-google'
import { registerUserUseCase } from '../../application/register-user'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'
import { buildAuthUrl } from '../../infrastructure/adapters/oidc/google-client'
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/user-repository-prisma'
import { LoginUserSchema } from '../http/schemas/login.schema'
import { RegisterUserSchema } from '../http/schemas/register.schema'

interface PrismaError extends Error {
  code?: string
}

interface JWTPayload {
  id?: string
  sub?: string
  email: string
  role?: string
}

export const registerUser = async (req: Request, res: Response) => {
  const parsed = RegisterUserSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues })
  }
  const { email, password, name, birthDate, phone, role } = parsed.data

  try {
    const user = await registerUserUseCase({
      email,
      password,
      name,
      birthDate,
      phone,
      role,
    })

    try {
      await sendVerificationEmail(user.email, user.verificationCode!)
    } catch (e) {
      console.warn('[sendVerificationEmail] failed:', e)
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user),
    })
  } catch (err) {
    const error = err as PrismaError
    if (error?.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'Email or phone already registered' })
    }
    console.error('[RegisterUser Error]', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const loginUserController = async (req: Request, res: Response) => {
  const result = LoginUserSchema.safeParse(req.body)

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

export const protectedRoute = (req: Request, res: Response) => {
  console.log('Usuario logueado:', req.user)
  res.json({ message: 'Todo ok', user: req.user })
}

export const initiateGoogleLogin = async (req: Request, res: Response) => {
  try {
    // Capturar el rol desde query params
    const role = req.query.role as string | undefined

    // Crear state con el rol incluido
    const stateData = {
      id: crypto.randomUUID(),
      role: role || 'USER', // default USER si no viene
    }

    // Codificar el state como JSON -> Base64
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64')

    const url = await buildAuthUrl(state)

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/',
    })

    console.log('[GOOGLE] auth url =>', url)
    console.log('[GOOGLE] state cookie con rol =>', stateData)

    return res.redirect(url)
  } catch (e) {
    console.error('Error en /google:', e)
    return res.status(500).json({ error: 'cannot start oauth' })
  }
}

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    console.log('[CALLBACK] URL completa:', req.originalUrl)
    console.log('[CALLBACK] Query:', req.query)
    console.log('[CALLBACK] Cookie state:', req.cookies?.oauth_state)

    const { state: stateParam, code } = req.query as {
      state?: string
      code?: string
    }
    if (!stateParam || !code) {
      return res.status(400).json({ error: 'Missing state or code' })
    }

    let stateData: { id: string; role?: string }
    try {
      stateData = JSON.parse(
        Buffer.from(stateParam, 'base64').toString('utf-8')
      )
    } catch {
      return res.status(400).json({ error: 'Invalid state format' })
    }

    console.log('[CALLBACK] State decodificado:', stateData)

    const repo = new UserRepositoryPrisma()
    const { token, user } = await loginWithGoogleUseCase(
      {
        state: stateParam,
        code,
        cookieState: req.cookies?.oauth_state,
        role: stateData.role,
      },
      { repo }
    )

    res.clearCookie('oauth_state')
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    console.log('[CALLBACK] Usuario autenticado:', {
      email: user.email,
      role: user.role,
    })

    return res.redirect(process.env.FRONTEND_URL ?? 'http://localhost:5173/')
  } catch (e) {
    const error = e as Error
    console.error('Google callback error:', error)

    // Redirigir al frontend con el error
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    const errorMessage = encodeURIComponent(error.message)
    return res.redirect(`${frontendUrl}/register?error=${errorMessage}`)
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  let token = null
  let payload = null

  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  if (!token) {
    token = req.cookies?.auth_token
  }

  if (!token) return res.json({ user: null })

  try {
    if (authHeader) {
      payload = jwtVerify(token, process.env.JWT_SECRET!) as JWTPayload
    } else {
      payload = jwtVerify(token, process.env.JWT_SECRET!) as JWTPayload
    }

    const repo = new UserRepositoryPrisma()
    const user = await repo.findByEmail(payload.email)
    return res.json({ user })
  } catch {
    return res.json({ user: null })
  }
}

export const logout = (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  res.json({ message: 'Logged out successfully' })
}
