import { Request, Response, NextFunction } from 'express'
import prisma from '../../../../lib/prisma'
import * as subscriptionService from '../../application/subscription-service'
import { handleStripeWebhook } from '../../application/webhook-handler'

/**
 * POST /api/subscriptions/checkout
 * Crea una sesión de Checkout para suscribirse
 */
export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const { workshopId } = req.body

    if (!workshopId) {
      return res.status(400).json({ error: 'workshopId es requerido' })
    }

    // Verificar que el usuario sea el owner del workshop
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    })

    if (!workshop || workshop.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para este taller' })
    }

    // ⭐ NO crear suscripción aquí - solo crear el checkout session
    // La suscripción se creará cuando Stripe confirme el pago via webhook

    // Crear sesión de checkout
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const session = await subscriptionService.createCheckoutSession({
      workshopId,
      ownerEmail: req.user.email,
      successUrl: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/subscription/cancel`,
    })

    res.json(session)
  } catch (error) {
    console.error('Error creando checkout session:', error)
    next(error)
  }
}

/**
 * POST /api/subscriptions/cancel
 * Cancela la suscripción del taller
 */
export const cancelSubscriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const { workshopId, immediate } = req.body

    if (!workshopId) {
      return res.status(400).json({ error: 'workshopId es requerido' })
    }

    // Verificar permisos
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    })

    if (!workshop || workshop.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    const subscription = await subscriptionService.cancelSubscription(workshopId, immediate)

    res.json({
      message: immediate
        ? 'Suscripción cancelada inmediatamente'
        : 'Suscripción cancelada al final del período',
      subscription,
    })
  } catch (error) {
    console.error('Error cancelando suscripción:', error)
    next(error)
  }
}

/**
 * GET /api/subscriptions/status/:workshopId
 * Obtiene el estado de la suscripción del taller
 */
export const getSubscriptionStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const { workshopId } = req.params

    // Verificar permisos
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    })

    if (!workshop || workshop.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    const status = await subscriptionService.checkWorkshopSubscription(workshopId)

    res.json(status)
  } catch (error) {
    console.error('Error obteniendo estado de suscripción:', error)
    next(error)
  }
}

/**
 * POST /api/subscriptions/portal
 * Crea una sesión del portal de facturación de Stripe
 */
export const createPortalSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const { workshopId } = req.body

    if (!workshopId) {
      return res.status(400).json({ error: 'workshopId es requerido' })
    }

    // Verificar permisos
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    })

    if (!workshop || workshop.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos' })
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const portal = await subscriptionService.createBillingPortalSession(
      workshopId,
      `${frontendUrl}/dashboard`
    )

    res.json(portal)
  } catch (error) {
    console.error('Error creando portal session:', error)
    next(error)
  }
}

/**
 * POST /api/webhooks/stripe
 * Webhook de Stripe
 */
export const stripeWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['stripe-signature'] as string

    if (!signature) {
      return res.status(400).json({ error: 'No signature provided' })
    }

    // El body debe ser raw buffer (configurado en express)
    const payload = req.body

    await handleStripeWebhook(payload, signature)

    res.json({ received: true })
  } catch (error) {
    console.error('Error en webhook:', error)
    res.status(400).json({ error: 'Webhook error' })
  }
}
