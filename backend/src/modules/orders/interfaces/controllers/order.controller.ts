import { NextFunction, Request, Response } from 'express'
import { cancelOrder } from '../../application/cancel-order'
import { createOrder } from '../../application/create-order'
import { getOrder } from '../../application/get-order'
import { getUserOrders } from '../../application/get-user-orders'
import { getWorkshopOrders } from '../../application/get-workshop-orders'
import { updateOrderStatus } from '../../application/update-order-status'
import { OrderRepositoryPrisma } from '../../infrastructure/persistence/prisma/order-repository-prisma'
import { WorkshopRepositoryPrisma } from '../../../workshops/infrastructure/persistence/prisma/workshop-repository-prisma'
import { BillingRepositoryPrisma } from '../../../billing/infrastructure/persistence/prisma/billing-repository-prisma'
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../schemas/order-schemas'

const orderRepo = new OrderRepositoryPrisma()
const workshopRepo = new WorkshopRepositoryPrisma()
const billingRepo = new BillingRepositoryPrisma()

/**
 * POST /api/orders
 * Crear un nuevo pedido
 */
export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const body = createOrderSchema.parse(req.body)

    const result = await createOrder(
      {
        userId: req.user.id,
        workshopId: body.workshopId,
        notes: body.notes ?? null,
        items: body.items,
      },
      {
        repo: orderRepo,
        workshopRepo: workshopRepo,
        authenticatedUserId: req.user.id,
      }
    )

    res.status(201).json(result)
  } catch (e) {
    console.error('Error in createOrderController:', e)
    next(e)
  }
}

// Los otros controladores permanecen igual...
/**
 * GET /api/orders/:id
 * Obtener un pedido por ID
 */
export const getOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const result = await getOrder(req.params.id, {
      repo: orderRepo,
      authenticatedUserId: req.user.id,
      userRole: req.user.role,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/orders/user/:userId
 * Obtener todos los pedidos de un usuario
 */
export const getUserOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const result = await getUserOrders(req.params.userId, {
      repo: orderRepo,
      authenticatedUserId: req.user.id,
      userRole: req.user.role,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/orders/workshop/:workshopId
 * También GET /api/owner/workshops/:id/orders
 * Obtener todos los pedidos de un taller
 */
export const getWorkshopOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    // Soportar ambos formatos de parámetros: :workshopId o :id
    const workshopId = req.params.workshopId || req.params.id

    const result = await getWorkshopOrders(workshopId, {
      repo: orderRepo,
      workshopRepo,
      authenticatedUserId: req.user.id,
      userRole: req.user.role,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

/**
 * PATCH /api/orders/:id/status
 * Actualizar el estado de un pedido (solo el dueño del taller)
 */
export const updateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const body = updateOrderStatusSchema.parse(req.body)
    const result = await updateOrderStatus(req.params.id, body, {
      repo: orderRepo,
      workshopRepo,
      billingRepo,
      authenticatedUserId: req.user.id,
      userRole: req.user.role,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

/**
 * POST /api/orders/:id/cancel
 * Cancelar un pedido (solo el cliente que lo creó)
 */
export const cancelOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const result = await cancelOrder(req.params.id, {
      repo: orderRepo,
      authenticatedUserId: req.user.id,
      userRole: req.user.role,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}
