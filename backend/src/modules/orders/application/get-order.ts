import type { Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'
import { verifyEntityExists, verifyAdminOrOwner } from '../../../lib/authorization'

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
  verifyEntityExists(order, 'Pedido')

  // Verificar permisos usando helper compartido
  verifyAdminOrOwner(
    order.userId,
    authenticatedUserId,
    userRole,
    order.workshop?.ownerId
  )

  return order
}
