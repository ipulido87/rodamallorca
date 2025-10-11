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
  // Intentar obtener token del header Authorization
  const authHeader =
    req.headers.authorization || (req.headers as any).Authorization
  let token: string | undefined

  if (authHeader) {
    const match = /^Bearer\s+(.+)$/i.exec(authHeader)
    if (match) {
      token = match[1]
    }
  }

  // Si no hay token en el header, buscar en cookies
  if (!token) {
    token = req.cookies?.auth_token // ✅ ESTO ES CRÍTICO
  }

  // Si no hay token en ningún lado, rechazar
  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Express.UserPayload
    if (!decoded.id || !decoded?.email) {
      return res.status(403).json({ message: 'Invalid token payload' })
    }
    req.user = decoded
    next()
  } catch {
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
