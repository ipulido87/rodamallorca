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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario. Se enviará un email de verificación.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: usuario@ejemplo.com
 *             password: miPassword123
 *             name: Juan García
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: El email ya está registrado
 */
router.post('/register', validateBody(RegisterUserSchema), registerUser)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: usuario@ejemplo.com
 *             password: miPassword123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales inválidas
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/login', validateBody(LoginUserSchema), loginUserController)

/**
 * @swagger
 * /api/auth/verify-link:
 *   get:
 *     summary: Verificar email mediante link
 *     description: Verifica el email del usuario usando el token enviado por correo
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación enviado por email
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/verify-link', verifyByLink)

/**
 * @swagger
 * /api/auth/protected:
 *   get:
 *     summary: Ruta protegida de prueba
 *     description: Endpoint para verificar que el token JWT es válido
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/protected', verifyToken, protectedRoute)

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Iniciar login con Google
 *     description: Redirige al usuario a Google para autenticación OAuth
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirección a Google OAuth
 */
router.get('/google', initiateGoogleLogin)
router.get('/google/callback', handleGoogleCallback)
router.get('/google/login', initiateGoogleLogin)
router.get('/google/login/callback', handleGoogleLogin)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     description: Devuelve los datos del usuario autenticado basándose en la cookie de sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No hay sesión activa
 */
router.get('/me', getCurrentUser)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Elimina la cookie de sesión y cierra la sesión del usuario
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
router.post('/logout', logout)

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Envía un email con el link para restablecer la contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Email enviado si el usuario existe
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/forgot-password', validateBody(ForgotPasswordSchema), forgotPasswordController)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña usando el token recibido por email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password', validateBody(ResetPasswordSchema), resetPasswordController)

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenviar email de verificación
 *     description: Envía nuevamente el email de verificación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de verificación reenviado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/resend-verification', validateBody(ResendVerificationSchema), resendVerification)

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil de usuario
 *     description: Actualiza el nombre y otros datos del perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/profile', verifyToken, validateBody(UpdateProfileSchema), updateProfile)

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.post('/change-password', verifyToken, validateBody(ChangePasswordSchema), changePassword)

/**
 * @swagger
 * /api/auth/settings:
 *   get:
 *     summary: Obtener configuración del usuario
 *     description: Devuelve las preferencias y configuración del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración del usuario
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Actualizar configuración del usuario
 *     description: Actualiza las preferencias y configuración del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: boolean
 *               language:
 *                 type: string
 *                 enum: [es, en, ca]
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/settings', verifyToken, getUserSettings)
router.put('/settings', verifyToken, validateBody(UpdateUserSettingsSchema), updateUserSettings)

export default router
