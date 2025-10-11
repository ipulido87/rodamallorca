import crypto from 'crypto'
import { Request, Response } from 'express'
import { verify as jwtVerify } from 'jsonwebtoken'
import prisma from '../../../../lib/prisma'
import { sanitizeUser } from '../../../../utils/sanitize-user'
import { loginUser } from '../../application/login-user'
import { loginWithGoogleUseCase } from '../../application/login-with-google'
import { registerUserUseCase } from '../../application/register-user'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'
import {
  getGoogleClient,
  handleCallback,
} from '../../infrastructure/adapters/oidc/google-client'
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/user-repository-prisma'
import { LoginUserSchema } from '../http/schemas/login.schema'
import { RegisterUserSchema } from '../http/schemas/register.schema'
import { generators } from 'openid-client'
import { signJwt } from '../../infrastructure/adapters/jwt/jwt.service'

interface PrismaError extends Error {
  code?: string
}

interface JWTPayload {
  id?: string
  sub?: string
  email: string
  role?: string
}

// Helper para redirects
const getFrontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost:5173'

export const registerUser = async (req: Request, res: Response) => {
  const parsed = RegisterUserSchema.safeParse(req.body)
  if (!parsed.success)
    return res.status(400).json({ errors: parsed.error.issues })

  try {
    const user = await registerUserUseCase(parsed.data)
    try {
      await sendVerificationEmail(user.email, user.verificationCode!)
    } catch {}

    return res.status(201).json({
      message: 'User registered successfully',
      user: sanitizeUser(user),
    })
  } catch (err) {
    const error = err as PrismaError
    if (error?.code === 'P2002')
      return res
        .status(409)
        .json({ message: 'Email or phone already registered' })
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const loginUserController = async (req: Request, res: Response) => {
  const result = LoginUserSchema.safeParse(req.body)
  if (!result.success)
    return res.status(400).json({ errors: result.error.issues })

  try {
    const { token, user } = await loginUser(
      result.data.email,
      result.data.password
    )
    res.json({ token, user })
  } catch {
    res.status(401).json({ error: 'Invalid email or password' })
  }
}

export const verifyUser = async (req: Request, res: Response) => {
  const email = String(req.body?.email).trim().toLowerCase()
  const code = req.body?.code

  if (!email || !code)
    return res.status(400).json({ message: 'missed data for verify' })

  const result = await prisma.user.updateMany({
    where: { email, verificationCode: code, verified: false },
    data: { verified: true, verificationCode: null, codeExpiresAt: null },
  })

  if (result.count === 0)
    return res
      .status(400)
      .json({ message: 'Código inválido, expirado o usuario ya verificado' })
  return res
    .status(200)
    .json({ message: '✅ Usuario verificado correctamente' })
}

export const protectedRoute = (req: Request, res: Response) => {
  res.json({ message: 'Todo ok', user: req.user })
}

export const initiateGoogleLogin = async (req: Request, res: Response) => {
  try {
    const isLogin = req.originalUrl.includes('/google/login')
    const role = req.query.role as string | undefined

    const stateData = {
      id: crypto.randomUUID(),
      role: role || 'USER',
    }

    const state = Buffer.from(JSON.stringify(stateData)).toString('base64')
    const codeVerifier = generators.codeVerifier()
    const codeChallenge = generators.codeChallenge(codeVerifier)

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/',
    })

    res.cookie('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/',
    })

    const client = await getGoogleClient()

    // ✅ REDIRECT URIS DIFERENTES
    const redirectUri = isLogin
      ? 'http://localhost:4000/api/auth/google/login/callback' // ← PARA LOGIN
      : process.env.GOOGLE_REDIRECT_URI! // ← PARA REGISTRO

    const url = client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      redirect_uri: redirectUri,
    })

    return res.redirect(url)
  } catch (e) {
    return res.status(500).json({ error: 'cannot start oauth' })
  }
}

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { state: stateParam, code } = req.query as {
      state?: string
      code?: string
    }
    if (!stateParam || !code)
      return res.status(400).json({ error: 'Missing state or code' })

    console.log('🔐 [CALLBACK] MODO REGISTRO - Creando usuario')

    let stateData: { id: string; role?: string }
    try {
      stateData = JSON.parse(
        Buffer.from(stateParam, 'base64').toString('utf-8')
      )
    } catch {
      return res.status(400).json({ error: 'Invalid state format' })
    }

    const repo = new UserRepositoryPrisma()
    const codeVerifier = req.cookies?.oauth_code_verifier as string
    if (!codeVerifier) throw new Error('Missing code verifier')

    const frontendUrl = getFrontendUrl()

    // ✅ ESTE ES EL ORIGINAL - SIEMPRE CREA USUARIOS
    const { token, user } = await loginWithGoogleUseCase(
      {
        state: stateParam,
        code,
        cookieState: req.cookies?.oauth_state,
        role: stateData.role,
        codeVerifier,
      },
      { repo }
    )

    res.clearCookie('oauth_state')
    res.clearCookie('oauth_code_verifier')

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    // Redirigir según el rol
    if (user.role === 'WORKSHOP_OWNER') {
      const workshop = await prisma.workshop.findFirst({
        where: { ownerId: user.id },
      })
      if (!workshop) {
        return res.redirect(`${frontendUrl}/create-workshop?firstTime=true`)
      }
      return res.redirect(`${frontendUrl}/dashboard`)
    }

    return res.redirect(`${frontendUrl}/home`)
  } catch (e) {
    const error = e as Error
    console.error('Google callback error:', error)
    const frontendUrl = getFrontendUrl()
    const errorMessage = encodeURIComponent(error.message)
    return res.redirect(`${frontendUrl}/login?error=${errorMessage}`)
  }
}

export const handleGoogleLogin = async (req: Request, res: Response) => {
  try {
    console.log('🔐 [LOGIN] MODO LOGIN - Solo verificando')

    const { state: stateParam, code } = req.query as {
      state?: string
      code?: string
    }
    if (!stateParam || !code)
      return res.status(400).json({ error: 'Missing state or code' })

    const repo = new UserRepositoryPrisma()
    const codeVerifier = req.cookies?.oauth_code_verifier as string
    if (!codeVerifier) throw new Error('Missing code verifier')

    const frontendUrl = getFrontendUrl()

    const u = await handleCallback(stateParam, code, codeVerifier)
    if (!u.email) throw new Error('No email from Google')

    // ✅ SOLO VERIFICAR - NO CREAR
    const existingUser = await repo.findByEmail(u.email)

    if (!existingUser) {
      console.log('🔐 [LOGIN] Usuario NO existe - redirigiendo a registro')
      return res.redirect(
        `${frontendUrl}/register?message=Usuario no registrado. Por favor regístrate primero.&email=${encodeURIComponent(
          u.email
        )}`
      )
    }

    // Usuario existe - hacer login
    const token = signJwt({
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role || undefined,
    })

    res.clearCookie('oauth_state')
    res.clearCookie('oauth_code_verifier')

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    // Redirigir según el rol
    if (existingUser.role === 'WORKSHOP_OWNER') {
      const workshop = await prisma.workshop.findFirst({
        where: { ownerId: existingUser.id },
      })
      if (!workshop) {
        return res.redirect(`${frontendUrl}/create-workshop?firstTime=true`)
      }
      return res.redirect(`${frontendUrl}/dashboard`)
    }

    return res.redirect(`${frontendUrl}/home`)
  } catch (e) {
    const error = e as Error
    console.error('Google login error:', error)
    const frontendUrl = getFrontendUrl()
    const errorMessage = encodeURIComponent(error.message)
    return res.redirect(`${frontendUrl}/login?error=${errorMessage}`)
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  const token =
    req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token
  if (!token) return res.json({ user: null })

  try {
    const payload = jwtVerify(token, process.env.JWT_SECRET!) as JWTPayload
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
