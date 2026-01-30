import { Request, Response } from 'express'
import { config } from '../../config/config'

/**
 * Opciones de cookies estandarizadas para toda la aplicación
 * Esto asegura consistencia en la configuración de seguridad
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
}

/**
 * Opciones de cookies para tokens de autenticación
 */
export const AUTH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  path: '/',
}

/**
 * Establece una cookie de autenticación con la configuración estándar
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, AUTH_COOKIE_OPTIONS)
}

/**
 * Elimina la cookie de autenticación
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth_token', { path: '/' })
}

/**
 * Valida que el usuario esté autenticado en el request
 * Lanza error si no hay usuario
 */
export function requireAuthUser(req: Request): { id: string; email: string; role: string } {
  if (!req.user) {
    const { UnauthenticatedError } = require('./error.helpers')
    throw new UnauthenticatedError('Usuario no autenticado')
  }
  return req.user
}

/**
 * Valida que el usuario tenga un rol específico
 * Lanza error si no tiene el rol requerido
 */
export function requireRole(req: Request, role: string): void {
  const user = requireAuthUser(req)
  if (user.role !== role) {
    const { UnauthorizedError } = require('./error.helpers')
    throw new UnauthorizedError('No tienes permisos para realizar esta acción')
  }
}

/**
 * Valida que el usuario sea WORKSHOP_OWNER
 */
export function requireWorkshopOwner(req: Request): { id: string; email: string; role: string } {
  const user = requireAuthUser(req)
  if (user.role !== 'WORKSHOP_OWNER') {
    const { UnauthorizedError } = require('./error.helpers')
    throw new UnauthorizedError('Solo los propietarios de talleres pueden realizar esta acción')
  }
  return user
}
