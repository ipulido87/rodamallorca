import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../../../../config/config' // usa tu fuente de env

// Si quieres reutilizar el tipo:
export type AuthenticatedRequest = Request & { user: Express.UserPayload }

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header =
    req.headers.authorization ||
    (req.headers.Authorization as string | undefined)
  if (!header)
    return res.status(401).json({ message: 'Missing Authorization header' })

  // Espera "Bearer <token>"
  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ message: 'Invalid Authorization format' })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Express.UserPayload
    // opcional: valida campos mínimos
    if (!decoded?.id || !decoded?.email) {
      return res.status(403).json({ message: 'Invalid token payload' })
    }
    req.user = decoded
    next()
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Úsalo después de verifyToken para garantizar req.user no es undefined
 * y obtener tipado fuerte en tus controllers.
 */
export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' })
  next()
}
