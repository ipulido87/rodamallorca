import { Router } from 'express'
import { verifyToken } from '../../interfaces/middlewares/auth.middleware'
import {
  getCurrentUser,
  handleGoogleCallback,
  handleGoogleLogin,
  initiateGoogleLogin,
  loginUserController,
  logout,
  protectedRoute,
  registerUser,
  verifyByLink, // ✅ SOLO ESTE MÉTODO
  resendVerification,
} from '../controllers/auth.controller'
import { validateBody } from '../middlewares/validate-body'
import { LoginUserSchema } from './schemas/login.schema'
import { RegisterUserSchema } from './schemas/register.schema'
// ❌ ELIMINAR: import { VerifyCodeSchema } from './schemas/verify-code.schema'
import {
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/password-reset.controller'

const router = Router()

// ✅ REGISTRO Y LOGIN
router.post('/register', validateBody(RegisterUserSchema), registerUser)
router.post('/login', validateBody(LoginUserSchema), loginUserController)

// ❌ ELIMINAR: router.post('/verify', validateBody(VerifyCodeSchema), verifyUser)
// ✅ SOLO VERIFICACIÓN POR LINK
router.get('/verify-link', verifyByLink)

router.get('/protected', verifyToken, protectedRoute)

// ✅ RUTAS DE GOOGLE
router.get('/google', initiateGoogleLogin)
router.get('/google/callback', handleGoogleCallback)
router.get('/google/login', initiateGoogleLogin)
router.get('/google/login/callback', handleGoogleLogin)

// ✅ OTRAS RUTAS
router.get('/me', getCurrentUser)
router.post('/logout', logout)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)
router.post('/resend-verification', resendVerification)

export default router
