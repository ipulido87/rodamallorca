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
  verifyByLink,
  resendVerification,
  updateProfile,
  changePassword,
  getUserSettings,
  updateUserSettings,
} from '../controllers/auth.controller'
import { validateBody } from '../middlewares/validate-body'
import { LoginUserSchema } from './schemas/login.schema'
import { RegisterUserSchema } from './schemas/register.schema'
import { ResendVerificationSchema } from './schemas/resend-verification.schema'
import { UpdateProfileSchema } from './schemas/update-profile.schema'
import { ChangePasswordSchema } from './schemas/change-password.schema'
import { UpdateUserSettingsSchema } from './schemas/update-settings.schema'
import { ForgotPasswordSchema } from './schemas/forgot-password.schema'
import { ResetPasswordSchema } from './schemas/reset-password.schema'
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
router.post('/forgot-password', validateBody(ForgotPasswordSchema), forgotPasswordController)
router.post('/reset-password', validateBody(ResetPasswordSchema), resetPasswordController)
router.post('/resend-verification', validateBody(ResendVerificationSchema), resendVerification)

// ✅ PROFILE Y SETTINGS
router.put('/profile', verifyToken, validateBody(UpdateProfileSchema), updateProfile)
router.post('/change-password', verifyToken, validateBody(ChangePasswordSchema), changePassword)
router.get('/settings', verifyToken, getUserSettings)
router.put('/settings', verifyToken, validateBody(UpdateUserSettingsSchema), updateUserSettings)

export default router
