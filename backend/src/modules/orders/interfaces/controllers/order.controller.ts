import { Request, Response } from 'express'
import { asyncHandler } from '../../../../utils/async-handler'
import { requireAuthUser } from '../../../../lib/helpers/auth.helpers'
import { cancelOrder } from '../../application/cancel-order'
import { createOrder } from '../../application/create-order'
import { getOrder } from '../../application/get-order'
import { getUserOrders } from '../../application/get-user-orders'
import { getWorkshopOrders } from '../../application/get-workshop-orders'
import { updateOrderStatus } from '../../application/update-order-status'
import { OrderRepositoryPrisma } from '../../infrastructure/persistence/prisma/order-repository-prisma'
import { WorkshopRepositoryPrisma } from '../../../workshops/infrastructure/persistence/prisma/workshop-repository-prisma'
import { billingRepositoryPrisma } from '../../../billing/infrastructure/persistence/prisma/billing-repository-prisma'

const orderRepo = new OrderRepositoryPrisma()
const workshopRepo = new WorkshopRepositoryPrisma()
const billingRepo = billingRepositoryPrisma

/**
 * POST /api/orders
 * Crear un nuevo pedido
 */
export const createOrderController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user = requireAuthUser(req)
  // Validación ya realizada por middleware validateBody
  const body = req.body

  const result = await createOrder(
    {
      userId: user.id,
      workshopId: body.workshopId,
      notes: body.notes ?? null,
      items: body.items,
    },
    {
      repo: orderRepo,
      workshopRepo: workshopRepo,
      authenticatedUserId: user.id,
    }
  )

  res.status(201).json(result)
})

/**
 * GET /api/orders/:id
 * Obtener un pedido por ID
 */
export const getOrderController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user = requireAuthUser(req)
  // Validación ya realizada por middleware validateParams

  const result = await getOrder(req.params.id, {
    repo: orderRepo,
    authenticatedUserId: user.id,
    userRole: user.role,
  })
  res.json(result)
})

/**
 * GET /api/orders/user/:userId
 * Obtener todos los pedidos de un usuario
 */
export const getUserOrdersController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user = requireAuthUser(req)
  // Validación ya realizada por middleware validateParams

  const result = await getUserOrders(req.params.userId, {
    repo: orderRepo,
    authenticatedUserId: user.id,
    userRole: user.role,
  })
  res.json(result)
})

/**
 * GET /api/orders/workshop/:workshopId
 * También GET /api/owner/workshops/:id/orders
 * Obtener todos los pedidos de un taller
 */
export const getWorkshopOrdersController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user = requireAuthUser(req)
  // Validación ya realizada por middleware validateParams

  // Soportar ambos formatos de parámetros: :workshopId o :id
  const workshopId = req.params.workshopId || req.params.id

  const result = await getWorkshopOrders(workshopId, {
    repo: orderRepo,
    workshopRepo,
    authenticatedUserId: user.id,
    userRole: user.role,
  })
  res.json(result)
})

/**
 * PATCH /api/orders/:id/status
 * Actualizar el estado de un pedido (solo el dueño del taller)
 */
export const updateOrderStatusController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user = requireAuthUser(req)
  // Validación ya realizada por middleware validateParams y validateBody

  const result = await updateOrderStatus(req.params.id, req.body, {
    repo: orderRepo,
    workshopRepo,
    billingRepo,
    authenticatedUserId: user.id,
    userRole: user.role,
  })
  res.json(result)
})

/**
 * POST /api/orders/:id/cancel
 * Cancelar un pedido (solo el cliente que lo creó)
 */
export const cancelOrderController = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const user = requireAuthUser(req)
  // Validación ya realizada por middleware validateParams y validateBody

  const result = await cancelOrder(req.params.id, {
    repo: orderRepo,
    authenticatedUserId: user.id,
    userRole: user.role,
    cancellationReason: req.body.cancellationReason || undefined,
  })
  res.json(result)
})
