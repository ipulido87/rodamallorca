import { Request, Response, NextFunction } from 'express'
import { checkWorkshopSubscription } from '../application/subscription-service'
import { SubscriptionRepositoryPrisma } from './persistence/prisma/subscription-repository-prisma'
import { WorkshopRepositoryPrisma } from '../../workshops/infrastructure/persistence/prisma/workshop-repository-prisma'
import { StripePaymentGateway } from '../../payments/infrastructure/gateways/stripe-payment-gateway'

// Singletons - se crean una sola vez al cargar el módulo
const subscriptionRepo = new SubscriptionRepositoryPrisma()
const workshopRepo = new WorkshopRepositoryPrisma()
const paymentGateway = new StripePaymentGateway()

/**
 * Middleware para verificar que un workshop tiene suscripción activa
 * Usado para proteger endpoints premium
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener workshopId desde params o body
    const workshopId = req.params.workshopId || req.body.workshopId

    if (!workshopId) {
      return res.status(400).json({
        error: 'workshopId es requerido',
        code: 'WORKSHOP_ID_MISSING',
      })
    }

    // Verificar suscripción (usa singletons del módulo)

    const { isActive, status } = await checkWorkshopSubscription(workshopId, {
      subscriptionRepo,
      workshopRepo,
      paymentGateway,
    })

    if (!isActive) {
      return res.status(403).json({
        error: 'Este taller no tiene una suscripción activa',
        code: 'SUBSCRIPTION_REQUIRED',
        status,
        message: getSubscriptionMessage(status),
      })
    }

    // Suscripción activa, continuar
    next()
  } catch (error) {
    console.error('Error verificando suscripción:', error)
    next(error)
  }
}

function getSubscriptionMessage(status: string | null): string {
  switch (status) {
    case 'TRIALING':
      return 'Tu período de prueba ha expirado. Suscríbete para continuar.'
    case 'PAST_DUE':
      return 'Tu pago está vencido. Actualiza tu método de pago.'
    case 'CANCELED':
      return 'Tu suscripción ha sido cancelada. Reactiva para continuar.'
    case 'UNPAID':
      return 'Hay pagos pendientes. Actualiza tu información de pago.'
    default:
      return 'Suscríbete para acceder a esta funcionalidad.'
  }
}

/**
 * Middleware suave: verifica suscripción pero solo añade info al request
 * No bloquea, solo informa
 */
export const checkSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workshopId = req.params.workshopId || req.body.workshopId

    if (workshopId) {
      const subscriptionInfo = await checkWorkshopSubscription(workshopId, {
        subscriptionRepo,
        workshopRepo,
        paymentGateway,
      })
      ;(req as any).subscription = subscriptionInfo
    }

    next()
  } catch (error) {
    console.error('Error en checkSubscription:', error)
    next()
  }
}
