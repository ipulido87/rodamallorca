import type { Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'

interface GetOrderDeps {
  repo: OrderRepository
  authenticatedUserId: string
  userRole: string
}

/**
 * Caso de uso: Obtener un pedido por ID
 * - Solo el cliente que lo creó, el dueño del taller, o un admin pueden verlo
 */
export async function getOrder(
  orderId: string,
  deps: GetOrderDeps
): Promise<Order> {
  const { repo, authenticatedUserId, userRole } = deps

  const order = await repo.findById(orderId, true)

  if (!order) {
    throw new Error('Pedido no encontrado')
  }

  // Verificar permisos
  const isOwner = order.userId === authenticatedUserId
  const isWorkshopOwner = order.workshop?.ownerId === authenticatedUserId
  const isAdmin = userRole === 'ADMIN'

  if (!isOwner && !isWorkshopOwner && !isAdmin) {
    throw new Error('No tienes permisos para ver este pedido')
  }

  return order
}
