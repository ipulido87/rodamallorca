import crypto from 'crypto'
import { Router } from 'express'
import {
  loginUserController,
  registerUser,
  verifyUser,
} from '../../interfaces/controllers/auth.controller'
import { verifyToken } from '../../interfaces/middlewares/auth.middleware'
import { validateBody } from '../../interfaces/middlewares/validateBody'
import { LoginUserSchema } from './schemas/login.schema'
import { RegisterUserSchema } from './schemas/register.schema'
import { VerifyCodeSchema } from './schemas/verify-code.schema'

// 👇 OIDC + JWT + Repo (ajusta paths si hace falta)
import { verify as jwtVerify } from 'jsonwebtoken'
import { loginWithGoogleUseCase } from '../../application/login-with-google'
import { buildAuthUrl } from '../../infrastructure/adapters/oidc/google-client'
import { UserRepositoryPrisma } from '../../infrastructure/persistence/prisma/user-repository-prisma'

const router = Router()

// ---------- Tus rutas existentes ----------
router.post('/register', validateBody(RegisterUserSchema), registerUser)
router.post('/login', validateBody(LoginUserSchema), loginUserController)

router.get('/protected', verifyToken, (req, res) => {
  console.log('Usuario logueado:', req.user)
  res.json({ message: 'Todo ok', user: req.user })
})

router.post('/verify', validateBody(VerifyCodeSchema), verifyUser)

// ---------- Google OAuth ----------
router.get('/google', async (req, res) => {
  try {
    const state = crypto.randomUUID()

    const url = await buildAuthUrl(state)

    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/',
    })

    const u = new URL(url)
    console.log('[GOOGLE] auth url =>', url)
    console.log(
      '[GOOGLE] redirect_uri enviado =>',
      u.searchParams.get('redirect_uri')
    )
    console.log('[GOOGLE] state cookie seteada =>', state)

    return res.redirect(url)
    // (equivalente) res.status(302).set('Location', url).end();
  } catch (e) {
    console.error('Error en /google:', e)
    return res.status(500).json({ error: 'cannot start oauth' })
  }
})

router.get('/google/callback', async (req, res) => {
  try {
    console.log('[CALLBACK] URL completa:', req.originalUrl)
    console.log('[CALLBACK] Query:', req.query)
    console.log('[CALLBACK] Cookie state:', req.cookies?.oauth_state)

    const { state, code } = req.query as { state?: string; code?: string }
    if (!state || !code)
      return res.status(400).json({ error: 'Missing state or code' })

    const repo = new UserRepositoryPrisma()
    const { token } = await loginWithGoogleUseCase(
      {
        state,
        code,
        cookieState: req.cookies?.oauth_state,
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

    return res.redirect(process.env.FRONTEND_URL ?? 'http://localhost:5173/')
  } catch (e: any) {
    console.error('Google callback error:', e)
    return res.status(500).json({ error: e?.message ?? 'unknown' })
  }
})

router.get('/me', async (req, res) => {
  const token = req.cookies?.auth_token
  if (!token) return res.json({ user: null })
  try {
    const payload = jwtVerify(token, process.env.JWT_SECRET!) as {
      sub: string
      email: string
    }
    const repo = new UserRepositoryPrisma()
    const user = await repo.findByEmail(payload.email)
    return res.json({ user })
  } catch {
    return res.json({ user: null })
  }
})

export default router
