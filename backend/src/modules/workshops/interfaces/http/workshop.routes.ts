import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  createWorkshopController,
  deleteWorkshopController,
  getMyWorkshopsController,
  getWorkshopController,
  updateWorkshopController,
} from '../controllers/workshop.controller'
import { getWorkshopOrdersController } from '../../../orders/interfaces/controllers/order.controller'
import { requireActiveSubscription } from '../../../subscriptions/interfaces/middlewares/subscription.middleware'

const r = Router()

// POST /api/owner/workshops (solo WORKSHOP_OWNER)
r.post(
  '/workshops',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  createWorkshopController
)

r.get(
  '/workshops/mine',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  getMyWorkshopsController
)

r.put(
  '/workshops/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  updateWorkshopController
)

r.delete(
  '/workshops/:id',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  deleteWorkshopController
)

// GET /api/catalog/workshops/:id - Público
r.get('/workshops/:id', getWorkshopController)

// GET /api/owner/workshops/:id/orders - Pedidos de un taller
r.get(
  '/workshops/:id/orders',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  requireActiveSubscription, // ⭐ Requiere suscripción activa
  getWorkshopOrdersController
)

// GET /api/owner/workshops/mine - Obtener mis talleres

// 🔧 TEMPORAL: Limpiar cuenta vieja de Stripe Connect
r.post(
  '/workshops/:id/reset-stripe',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  async (req, res, next) => {
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      const workshopId = req.params.id

      const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
      })

      if (!workshop) {
        return res.status(404).json({ error: 'Taller no encontrado' })
      }

      if (workshop.ownerId !== req.user!.id) {
        return res.status(403).json({ error: 'No tienes permisos' })
      }

      await prisma.workshop.update({
        where: { id: workshopId },
        data: {
          stripeConnectedAccountId: null,
          stripeOnboardingComplete: false,
        },
      })

      await prisma.$disconnect()

      res.json({
        success: true,
        message: 'Cuenta de Stripe limpiada. Ahora puedes reconectar.'
      })
    } catch (error) {
      console.error('Error limpiando Stripe:', error)
      next(error)
    }
  }
)

export default r
