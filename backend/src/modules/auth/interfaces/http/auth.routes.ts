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

const router = Router()

router.post('/register', validateBody(RegisterUserSchema), registerUser)
router.post('/login', validateBody(LoginUserSchema), loginUserController)
router.post('/verify', validateBody(VerifyCodeSchema), verifyUser)
router.get('/protected', verifyToken, protectedRoute)

// ✅ RUTAS DE GOOGLE COMPLETAS:
router.get('/google', initiateGoogleLogin) // Para registro
router.get('/google/callback', handleGoogleCallback) // Para registro

router.get('/google/login', initiateGoogleLogin) // Para login
router.get('/google/login/callback', handleGoogleLogin) // ← AÑADE ESTA RUTA

router.get('/me', getCurrentUser)
router.post('/logout', logout)

export default router
