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

const getFrontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost:5173'

export const registerUser = async (req: Request, res: Response) => {
  console.log('🔍 [REGISTER] Body recibido:', req.body)

  const parsed = RegisterUserSchema.safeParse(req.body)
  console.log('🔍 [REGISTER] Parsed data:', parsed.data)

  if (!parsed.success) {
    console.log('❌ [REGISTER] Validation errors:', parsed.error)
    return res.status(400).json({ errors: parsed.error.issues })
  }

  try {
    const user = await registerUserUseCase(parsed.data)
    console.log('✅ [REGISTER] Usuario creado:', user)

    // ✅ CREAR WORKSHOP
    if (user.role === 'WORKSHOP_OWNER') {
      console.log('🔧 [REGISTER] Creando workshop para WORKSHOP_OWNER')

      const workshop = await prisma.workshop.create({
        data: {
          ownerId: user.id,
          name: `Taller de ${user.name}`,
          description: `Taller de ${user.name}`,
          address: null,
          city: null,
          country: null,
          phone: null,
        },
      })
      console.log('✅ [REGISTER] Workshop creado:', workshop.id)
    }

    try {
      await sendVerificationEmail(user.email, user.verificationCode!)
    } catch (e) {
      console.warn('❌ [REGISTER] Error enviando email:', e)
    }

    return res.status(201).json({
      message:
        'User registered successfully. Check your email to verify your account.',
      user: sanitizeUser(user),
    })
  } catch (err) {
    console.error('❌ [REGISTER] Error completo:', err)
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

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    res.json({ token, user })
  } catch (error) {
    console.error('❌ [LOGIN_CONTROLLER] Error completo:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    if (
      errorMessage.includes('User not verified') ||
      errorMessage.includes('not verified')
    ) {
      return res.status(403).json({
        error: 'EMAIL_NOT_VERIFIED',
        message:
          'Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
        email: result.data.email, // ✅ AGREGAR EMAIL PARA REENVÍO
      })
    }

    if (
      errorMessage.includes('Invalid credentials') ||
      errorMessage.includes('Invalid email or password')
    ) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos',
      })
    }

    return res.status(401).json({
      error: 'LOGIN_FAILED',
      message: 'Error al iniciar sesión',
    })
  }
}

// ✅ ELIMINAR verifyUser - ya no se usa código manual

// ✅ MEJORAR verifyByLink - único método de verificación
export const verifyByLink = async (req: Request, res: Response) => {
  const { email, code } = req.query as { email?: string; code?: string }

  console.log('🔍 [VERIFY_BY_LINK] Iniciando verificación:', { email, code })

  if (!email || !code) {
    console.log('❌ [VERIFY_BY_LINK] Faltan datos')
    return res.redirect(`${getFrontendUrl()}/verify?error=missing_data`)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      console.log('❌ [VERIFY_BY_LINK] Usuario no encontrado:', email)
      return res.redirect(`${getFrontendUrl()}/verify?error=user_not_found`)
    }

    if (user.verified) {
      console.log('⚠️ [VERIFY_BY_LINK] Usuario ya verificado:', email)

      // ✅ SI YA ESTÁ VERIFICADO, GENERAR TOKEN Y LOGUEARLO
      const token = signJwt({
        id: user.id,
        email: user.email,
        role: user.role || undefined,
      })

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      })

      const redirectPath =
        user.role === 'WORKSHOP_OWNER' ? '/dashboard' : '/home'
      return res.redirect(`${getFrontendUrl()}${redirectPath}`)
    }

    if (user.verificationCode !== code) {
      console.log('❌ [VERIFY_BY_LINK] Código inválido')
      return res.redirect(
        `${getFrontendUrl()}/verify?error=invalid_code&email=${email}`
      )
    }

    if (user.codeExpiresAt && user.codeExpiresAt < new Date()) {
      console.log('❌ [VERIFY_BY_LINK] Código expirado')
      return res.redirect(
        `${getFrontendUrl()}/verify?error=code_expired&email=${email}`
      )
    }

    // ✅ VERIFICAR USUARIO
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        verified: true,
        verificationCode: null,
        codeExpiresAt: null,
      },
    })

    // ✅ GENERAR TOKEN Y COOKIE
    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role || undefined,
    })

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    console.log('✅ [VERIFY_BY_LINK] Usuario verificado y logueado:', email)

    // ✅ REDIRIGIR DIRECTAMENTE A LA APP (sin pasar por callback)
    const redirectPath = user.role === 'WORKSHOP_OWNER' ? '/dashboard' : '/home'
    return res.redirect(`${getFrontendUrl()}${redirectPath}`)
  } catch (error) {
    console.error('❌ [VERIFY_BY_LINK] Error:', error)
    return res.redirect(`${getFrontendUrl()}/verify?error=server_error`)
  }
}

export const protectedRoute = (req: Request, res: Response) => {
  res.json({ message: 'Todo ok', user: req.user })
}

export const initiateGoogleLogin = async (req: Request, res: Response) => {
  try {
    const isLogin = req.originalUrl.includes('/google/login')

    console.log('🔍 [INITIATE_GOOGLE] URL:', req.originalUrl)
    console.log('🔍 [INITIATE_GOOGLE] isLogin:', isLogin)
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

    const redirectUri = isLogin
      ? process.env.GOOGLE_LOGIN_REDIRECT_URI!
      : process.env.GOOGLE_REDIRECT_URI!

    console.log('🔍 [INITIATE_GOOGLE] Redirect URI:', redirectUri)

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

    console.log('🔍 [CALLBACK] MODO REGISTRO - Creando usuario')

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

    if (user.role === 'WORKSHOP_OWNER') {
      const existingWorkshop = await prisma.workshop.findFirst({
        where: { ownerId: user.id },
      })

      if (!existingWorkshop) {
        console.log('🔧 [CALLBACK] Creando workshop para nuevo WORKSHOP_OWNER')
        await prisma.workshop.create({
          data: {
            ownerId: user.id,
            name: `Taller de ${user.name}`,
            description: `Taller de ${user.name}`,
            address: null,
            city: null,
            country: null,
            phone: null,
          },
        })
        console.log('✅ [CALLBACK] Workshop creado automáticamente')
      }
    }

    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
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
    console.log('🔍 [LOGIN] MODO LOGIN - Solo verificando')

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

    const u = await handleCallback(
      stateParam,
      code,
      codeVerifier,
      process.env.GOOGLE_LOGIN_REDIRECT_URI
    )
    if (!u.email) throw new Error('No email from Google')

    const existingUser = await repo.findByEmail(u.email)

    if (!existingUser) {
      console.log('🔍 [LOGIN] Usuario NO existe - redirigiendo a registro')
      return res.redirect(
        `${frontendUrl}/register?message=Usuario no registrado. Por favor regístrate primero.&email=${encodeURIComponent(
          u.email
        )}`
      )
    }

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

    if (existingUser.role === 'WORKSHOP_OWNER') {
      const workshop = await prisma.workshop.findFirst({
        where: { ownerId: existingUser.id },
      })
      if (!workshop) {
        return res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
      }
      return res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
    }

    return res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
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

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      error: 'EMAIL_REQUIRED',
      message: 'El email es requerido',
    })
  }

  try {
    console.log('🔍 [RESEND_VERIFICATION] Solicitado para:', email)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      console.log('❌ [RESEND_VERIFICATION] Usuario no encontrado:', email)
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      })
    }

    if (user.verified) {
      console.log('❌ [RESEND_VERIFICATION] Usuario ya verificado:', email)
      return res.status(400).json({
        error: 'ALREADY_VERIFIED',
        message: 'El usuario ya está verificado',
      })
    }

    // Generar nuevo código de verificación
    const verificationCode = Math.random().toString(36).substring(2, 15)
    const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        verificationCode,
        codeExpiresAt,
      },
    })

    console.log('✅ [RESEND_VERIFICATION] Nuevo código generado para:', email)

    try {
      await sendVerificationEmail(email, verificationCode)
      console.log('✅ [RESEND_VERIFICATION] Email enviado a:', email)
    } catch (emailError) {
      console.error(
        '❌ [RESEND_VERIFICATION] Error enviando email:',
        emailError
      )
    }

    return res.status(200).json({
      message: 'Email de verificación reenviado. Revisa tu bandeja de entrada.',
    })
  } catch (error) {
    console.error('❌ [RESEND_VERIFICATION] Error:', error)
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error al reenviar el email de verificación',
    })
  }
}
