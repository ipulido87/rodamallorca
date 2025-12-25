import { Router } from 'express'
import { verifyToken } from '../../interfaces/middlewares/auth.middleware'
import {
  getCurrentUser,
  handleGoogleCallback,
  initiateGoogleLogin,
  loginUserController,
  logout,
  protectedRoute,
  registerUser,
  verifyByLink, // ✅ SOLO ESTE MÉTODO
  resendVerification,
  updateProfile,
  changePassword,
  getUserSettings,
  updateUserSettings,
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

// ✅ RUTAS DE GOOGLE (usa la MISMA callback para login y registro)
router.get('/google', initiateGoogleLogin) // Registro
router.get('/google/login', initiateGoogleLogin) // Login
router.get('/google/callback', handleGoogleCallback) // Única callback

// ✅ OTRAS RUTAS
router.get('/me', getCurrentUser)
router.post('/logout', logout)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)
router.post('/resend-verification', resendVerification)

// ✅ PROFILE Y SETTINGS
router.put('/profile', verifyToken, updateProfile)
router.post('/change-password', verifyToken, changePassword)
router.get('/settings', verifyToken, getUserSettings)
router.put('/settings', verifyToken, updateUserSettings)

export default router
