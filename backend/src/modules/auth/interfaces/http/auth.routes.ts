import { Router } from 'express'
import { verifyToken } from '../../interfaces/middlewares/auth.middleware'
import {
  getCurrentUser,
  handleGoogleCallback,
  handleGoogleLogin, // ← AÑADE esto
  initiateGoogleLogin,
  loginUserController,
  logout,
  protectedRoute,
  registerUser,
  verifyUser,
} from '../controllers/auth.controller'
import { validateBody } from '../middlewares/validate-body'
import { LoginUserSchema } from './schemas/login.schema'
import { RegisterUserSchema } from './schemas/register.schema'
import { VerifyCodeSchema } from './schemas/verify-code.schema'
import {
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/password-reset.controller'

const router = Router()

router.post('/register', validateBody(RegisterUserSchema), registerUser)
router.post('/login', validateBody(LoginUserSchema), loginUserController)
router.post('/verify', validateBody(VerifyCodeSchema), verifyUser)
router.get('/protected', verifyToken, protectedRoute)

// ✅ RUTAS DE GOOGLE COMPLETAS:
router.get('/google', initiateGoogleLogin)
router.get('/google/callback', handleGoogleCallback)

router.get('/google/login', initiateGoogleLogin)
router.get('/google/login/callback', handleGoogleLogin)
router.get('/me', getCurrentUser)
router.post('/logout', logout)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)

export default router
