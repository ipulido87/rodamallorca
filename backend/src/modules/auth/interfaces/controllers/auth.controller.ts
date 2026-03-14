import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { verify as jwtVerify } from 'jsonwebtoken'
import prisma from '../../../../lib/prisma'
import { sanitizeUser } from '../../../../utils/sanitize-user'
import { loginUser } from '../../application/login-user'
import { loginWithGoogleUseCase } from '../../application/login-with-google'
import { sendVerificationEmail } from '../../infrastructure/adapters/email/email-service'
import {
  getGoogleClient,
  handleCallback,
} from '../../infrastructure/adapters/oidc/google-client'
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/user-repository-prisma'
import { JwtTokenService } from '../../infrastructure/adapters/jwt/token-service-impl'
import { GoogleOidcService } from '../../infrastructure/adapters/oidc/oidc-service-impl'
import { LoginUserSchema } from '../http/schemas/login.schema'
import { RegisterUserSchema } from '../http/schemas/register.schema'
import { generators } from 'openid-client'
import { signJwt } from '../../infrastructure/adapters/jwt/jwt.service'
import { asyncHandler } from '../../../../utils/async-handler'
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  UnauthenticatedError,
  ValidationError,
  BadRequestError,
  assertExists,
} from '../../../../lib/helpers/error.helpers'
import {
  setAuthCookie,
  clearAuthCookie,
  requireAuthUser,
} from '../../../../lib/helpers/auth.helpers'

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

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  console.log('🔍 [REGISTER] Body recibido:', req.body)

  const parsed = RegisterUserSchema.safeParse(req.body)
  console.log('🔍 [REGISTER] Parsed data:', parsed.data)

  if (!parsed.success) {
    console.log('❌ [REGISTER] Validation errors:', parsed.error)
    throw new ValidationError('Validation failed', parsed.error.issues)
  }

  // Generar verificationCode
  const verificationCode = crypto.randomUUID()
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
  const passwordHash = await bcrypt.hash(parsed.data.password, 10)

  let user
  try {
    // Crear usuario directamente con Prisma para tener acceso a todos los campos
    user = await prisma.user.create({
      data: {
        email: parsed.data.email.trim().toLowerCase(),
        password: passwordHash,
        name: parsed.data.name,
        birthDate: parsed.data.birthDate ?? null,
        phone: parsed.data.phone ?? null,
        role: parsed.data.role || 'USER',
        verificationCode,
        codeExpiresAt,
        verified: false,
      },
    })
    console.log('✅ [REGISTER] Usuario creado:', user)
  } catch (err: any) {
    console.error('❌ [REGISTER] Error completo:', err)
    if (err?.code === 'P2002') {
      throw new ConflictError('Email or phone already registered')
    }
    throw err
  }

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

  res.status(201).json({
    message:
      'User registered successfully. Check your email to verify your account.',
    user: sanitizeUser(user),
  })
})

export const loginUserController = asyncHandler(async (req: Request, res: Response) => {
  const result = LoginUserSchema.safeParse(req.body)
  if (!result.success) {
    throw new ValidationError('Validation failed', result.error.issues)
  }

  try {
    const userRepo = new UserRepositoryPrisma()
    const tokenService = new JwtTokenService()
    const { token, user } = await loginUser(
      result.data.email,
      result.data.password,
      { userRepo, tokenService }
    )

    setAuthCookie(res, token)

    res.json({ token, user })
  } catch (error) {
    console.error('❌ [LOGIN_CONTROLLER] Error completo:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    if (
      errorMessage.includes('User not verified') ||
      errorMessage.includes('not verified')
    ) {
      const err: any = new UnauthorizedError(
        'Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
      )
      err.code = 'EMAIL_NOT_VERIFIED'
      err.email = result.data.email
      throw err
    }

    if (
      errorMessage.includes('Invalid credentials') ||
      errorMessage.includes('Invalid email or password')
    ) {
      const err: any = new UnauthenticatedError('Email o contraseña incorrectos')
      err.code = 'INVALID_CREDENTIALS'
      throw err
    }

    throw new UnauthenticatedError('Error al iniciar sesión')
  }
})

// ✅ ELIMINAR verifyUser - ya no se usa código manual

// ✅ MEJORAR verifyByLink - único método de verificación
export const verifyByLink = async (req: Request, res: Response) => {
  const { email, code } = req.query as { email?: string; code?: string }

  console.log('🔍 [VERIFY_BY_LINK] Iniciando verificación:', { email, code })

  if (!email || !code) {
    console.log('❌ [VERIFY_BY_LINK] Faltan datos')
    return res.redirect(`${getFrontendUrl()}/login?error=${encodeURIComponent('Enlace de verificación inválido')}`)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      console.log('❌ [VERIFY_BY_LINK] Usuario no encontrado:', email)
      return res.redirect(`${getFrontendUrl()}/login?error=${encodeURIComponent('Usuario no encontrado')}`)
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

      // ✅ Usar el mismo callback para manejar lógica de workshops
      return res.redirect(`${getFrontendUrl()}/email-verified?token=${encodeURIComponent(token)}`)
    }

    if (user.verificationCode !== code) {
      console.log('❌ [VERIFY_BY_LINK] Código inválido')
      return res.redirect(
        `${getFrontendUrl()}/login?error=${encodeURIComponent('Código de verificación inválido')}`
      )
    }

    if (user.codeExpiresAt && user.codeExpiresAt < new Date()) {
      console.log('❌ [VERIFY_BY_LINK] Código expirado')
      return res.redirect(
        `${getFrontendUrl()}/login?error=${encodeURIComponent('El código de verificación ha expirado')}`
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

    // ✅ REDIRIGIR A CALLBACK QUE MANEJA LA LÓGICA DE WORKSHOPS Y STRIPE
    return res.redirect(`${getFrontendUrl()}/email-verified?token=${encodeURIComponent(token)}`)
  } catch (error) {
    console.error('❌ [VERIFY_BY_LINK] Error:', error)
    return res.redirect(`${getFrontendUrl()}/login?error=${encodeURIComponent('Error al verificar la cuenta')}`)
  }
}

export const protectedRoute = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuthUser(req)
  res.json({ message: 'Todo ok', user })
})

export const initiateGoogleLogin = asyncHandler(async (req: Request, res: Response) => {
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
    ? (process.env.GOOGLE_LOGIN_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI!)
    : process.env.GOOGLE_REDIRECT_URI!

  console.log('🔍 [INITIATE_GOOGLE] Redirect URI:', redirectUri)

  const url = client.authorizationUrl({
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    redirect_uri: redirectUri,
  })

  res.redirect(url)
})

export const handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
  const { state: stateParam, code } = req.query as {
    state?: string
    code?: string
  }

  if (!stateParam || !code) {
    throw new BadRequestError('Missing state or code')
  }

  console.log('🔍 [CALLBACK] MODO REGISTRO - Creando usuario')

  let stateData: { id: string; role?: string }
  try {
    stateData = JSON.parse(
      Buffer.from(stateParam, 'base64').toString('utf-8')
    )
  } catch {
    throw new BadRequestError('Invalid state format')
  }

  const repo = new UserRepositoryPrisma()
  const tokenService = new JwtTokenService()
  const oidcService = new GoogleOidcService()
  const codeVerifier = req.cookies?.oauth_code_verifier as string
  if (!codeVerifier) {
    throw new BadRequestError('Missing code verifier')
  }

  const frontendUrl = getFrontendUrl()

  try {
    const { token, user } = await loginWithGoogleUseCase(
      {
        state: stateParam,
        code,
        cookieState: req.cookies?.oauth_state,
        role: stateData.role,
        codeVerifier,
      },
      { repo, tokenService, oidcService }
    )

    res.clearCookie('oauth_state')
    res.clearCookie('oauth_code_verifier')

    setAuthCookie(res, token)

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

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  } catch (e) {
    const error = e as Error
    console.error('Google callback error:', error)
    const errorMessage = encodeURIComponent(error.message)
    res.redirect(`${frontendUrl}/auth/callback?error=${errorMessage}`)
  }
})

export const handleGoogleLogin = asyncHandler(async (req: Request, res: Response) => {
  console.log('🔍 [LOGIN] MODO LOGIN - Solo verificando')

  const { state: stateParam, code } = req.query as {
    state?: string
    code?: string
  }

  if (!stateParam || !code) {
    throw new BadRequestError('Missing state or code')
  }

  const repo = new UserRepositoryPrisma()
  const codeVerifier = req.cookies?.oauth_code_verifier as string
  if (!codeVerifier) {
    throw new BadRequestError('Missing code verifier')
  }

  const frontendUrl = getFrontendUrl()

  try {
    const u = await handleCallback(
      stateParam,
      code,
      codeVerifier,
      process.env.GOOGLE_LOGIN_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI
    )

    if (!u.email) {
      throw new BadRequestError('No email from Google')
    }

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

    setAuthCookie(res, token)

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  } catch (e) {
    const error = e as Error
    console.error('Google login error:', error)
    const errorMessage = encodeURIComponent(error.message)
    res.redirect(`${frontendUrl}/auth/callback?error=${errorMessage}`)
  }
})

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const token =
    req.headers.authorization?.replace('Bearer ', '') || req.cookies?.auth_token

  if (!token) {
    throw new UnauthenticatedError('No autenticado')
  }

  const payload = jwtVerify(token, process.env.JWT_SECRET!) as JWTPayload
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  })

  assertExists(user, 'Usuario')

  const sanitized = sanitizeUser(user)

  // ⭐ Si es WORKSHOP_OWNER, incluir estado de suscripción
  if (user.role === 'WORKSHOP_OWNER') {
    const workshops = await prisma.workshop.findMany({
      where: { ownerId: user.id },
      include: {
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
            trialEnd: true,
          },
        },
      },
    })

    // Verificar si tiene al menos un taller con suscripción activa
    const hasActiveSubscription = workshops.some((w) => {
      const status = w.subscription?.status
      return status === 'ACTIVE' || status === 'TRIALING'
    })

    res.json({
      ...sanitized,
      hasActiveSubscription,
      workshopsCount: workshops.length,
    })
    return
  }

  // Retornar usuario directamente (sin wrapper)
  res.json(sanitized)
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookie(res)
  res.json({ message: 'Logged out successfully' })
})

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  // Validación ya realizada por middleware validateBody
  const { email } = req.body

  console.log('🔍 [RESEND_VERIFICATION] Solicitado para:', email)

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    console.log('❌ [RESEND_VERIFICATION] Usuario no encontrado:', email)
    throw new NotFoundError('Usuario')
  }

  if (user.verified) {
    console.log('❌ [RESEND_VERIFICATION] Usuario ya verificado:', email)
    throw new BadRequestError('El usuario ya está verificado')
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

  res.status(200).json({
    message: 'Email de verificación reenviado. Revisa tu bandeja de entrada.',
  })
})

// ========================================
// NUEVOS ENDPOINTS PARA PROFILE Y SETTINGS
// ========================================

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuthUser(req)

  // Validación ya realizada por middleware validateBody
  const { name, phone, birthDate } = req.body

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name || undefined,
      phone: phone || undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    },
  })

  res.json(sanitizeUser(updatedUser))
})

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const authUser = requireAuthUser(req)

  // Validación ya realizada por middleware validateBody
  const { currentPassword, newPassword } = req.body

  // Obtener usuario con contraseña
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  })

  assertExists(user, 'Usuario')

  if (!user.password) {
    throw new BadRequestError('Usuario no tiene contraseña configurada')
  }

  // Verificar contraseña actual
  const bcryptLib = require('bcryptjs')
  const isValid = await bcryptLib.compare(currentPassword, user.password)
  if (!isValid) {
    throw new BadRequestError('Contraseña actual incorrecta')
  }

  // Hashear nueva contraseña
  const hashedPassword = await bcryptLib.hash(newPassword, 10)

  // Actualizar contraseña
  await prisma.user.update({
    where: { id: authUser.id },
    data: { password: hashedPassword },
  })

  res.json({ message: 'Contraseña actualizada correctamente' })
})

export const getUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuthUser(req)

  try {
    // Buscar settings del usuario
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    })

    // Si no existen, crear defaults
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          settings: {
            notifications: {
              email: {
                orders: true,
                marketing: false,
                updates: true,
              },
              push: {
                orders: true,
                messages: true,
              },
            },
            preferences: {
              language: 'es',
            },
            privacy: {
              profileVisible: true,
              showEmail: false,
              showPhone: false,
            },
          },
        },
      })
    }

    res.json(settings.settings)
  } catch (error) {
    console.error('❌ [GET_USER_SETTINGS] Error:', error)
    // Si no existe la tabla, retornar defaults
    res.json({
      notifications: {
        email: {
          orders: true,
          marketing: false,
          updates: true,
        },
        push: {
          orders: true,
          messages: true,
        },
      },
      preferences: {
        language: 'es',
      },
      privacy: {
        profileVisible: true,
        showEmail: false,
        showPhone: false,
      },
    })
  }
})

export const updateUserSettings = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuthUser(req)

  const newSettings = req.body

  // Upsert settings
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      settings: newSettings,
    },
    create: {
      userId: user.id,
      settings: newSettings,
    },
  })

  res.json(settings.settings)
})
