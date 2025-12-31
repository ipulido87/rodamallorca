import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role?: string
  }
}

/**
 * Middleware que verifica que el usuario tenga una suscripción ACTIVA o TRIALING
 * SOLO aplica para WORKSHOP_OWNER
 */
export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({
        error: 'NO_AUTH',
        message: 'Debes iniciar sesión',
      })
    }

    // ✅ Si NO es WORKSHOP_OWNER, permitir acceso (usuarios normales no necesitan suscripción)
    if (user.role !== 'WORKSHOP_OWNER') {
      return next()
    }

    // ✅ Es WORKSHOP_OWNER → Verificar suscripción
    console.log(`🔒 [SubscriptionMiddleware] Verificando suscripción para user: ${user.email}`)

    // Obtener talleres del usuario
    const workshops = await prisma.workshop.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        subscription: true,
      },
    })

    if (!workshops || workshops.length === 0) {
      console.log(`❌ [SubscriptionMiddleware] Usuario sin talleres`)
      return res.status(403).json({
        error: 'NO_WORKSHOP',
        message: 'Debes crear un taller primero',
        redirectTo: '/create-workshop',
      })
    }

    // Verificar si ALGUNO de los talleres tiene suscripción activa
    const hasActiveSubscription = workshops.some((workshop) => {
      if (!workshop.subscription) return false

      const status = workshop.subscription.status
      const isActive = status === 'ACTIVE' || status === 'TRIALING'

      console.log(`🔍 [SubscriptionMiddleware] Taller ${workshop.id} - Suscripción: ${status} - Activa: ${isActive}`)

      return isActive
    })

    if (!hasActiveSubscription) {
      console.log(`❌ [SubscriptionMiddleware] Ningún taller tiene suscripción activa`)
      return res.status(403).json({
        error: 'NO_ACTIVE_SUBSCRIPTION',
        message: 'Debes activar tu suscripción para acceder a esta funcionalidad',
        redirectTo: '/pricing',
      })
    }

    console.log(`✅ [SubscriptionMiddleware] Suscripción activa verificada`)
    next()
  } catch (error) {
    console.error('❌ [SubscriptionMiddleware] Error:', error)
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error al verificar suscripción',
    })
  }
}

/**
 * Middleware más permisivo que solo verifica suscripción para endpoints críticos
 * Permite acceso a endpoints de lectura pero bloquea escritura sin suscripción
 */
export const requireSubscriptionForWrite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Solo aplicar a métodos de escritura
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next()
  }

  // Para escritura, aplicar verificación completa
  return requireActiveSubscription(req, res, next)
}
