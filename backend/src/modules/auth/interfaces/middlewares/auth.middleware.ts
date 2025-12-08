import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../../../config/config'

// Para tipar req.user (asegúrate de tener src/types/express.d.ts)
export type AuthenticatedRequest = Request & { user: Express.UserPayload }

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🔐 [VERIFY_TOKEN] === INICIANDO ===')
  console.log('🔐 [VERIFY_TOKEN] Cookies recibidas:', req.cookies)
  console.log('🔐 [VERIFY_TOKEN] Headers:', req.headers)

  // 1. Header Authorization
  const authHeader = req.headers.authorization
  let token: string | undefined

  if (authHeader) {
    const match = /^Bearer\s+(.+)$/i.exec(authHeader)
    if (match) {
      token = match[1]
      console.log('✅ [VERIFY_TOKEN] Token de header encontrado')
    }
  }

  // 2. Cookies
  if (!token && req.cookies?.auth_token) {
    token = req.cookies.auth_token
    console.log('✅ [VERIFY_TOKEN] Token de cookie encontrado')
  }

  if (!token) {
    console.log('❌ [VERIFY_TOKEN] No hay token en ningún lado')
    return res.status(401).json({ message: 'Missing authentication token' })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Express.UserPayload
    console.log('✅ [VERIFY_TOKEN] Token válido.')
    console.log('📋 [VERIFY_TOKEN] Payload completo:', JSON.stringify(decoded, null, 2))
    console.log('🔑 [VERIFY_TOKEN] decoded.id:', decoded.id)
    console.log('📧 [VERIFY_TOKEN] decoded.email:', decoded.email)
    console.log('👤 [VERIFY_TOKEN] decoded.role:', decoded.role)
    req.user = decoded
    next()
  } catch (error) {
    console.log('❌ [VERIFY_TOKEN] Token inválido:', error)
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
  next()
}

export const requireRole = (
  ...roles: NonNullable<Express.UserPayload['role']>[]
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [requireRole] User:', req.user)
    console.log('🔍 [requireRole] Required roles:', roles)
    console.log('🔍 [requireRole] User role:', req.user?.role)

    if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
    // Si tu JWT aún no trae role, esto te protege de undefined
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}
