import type { Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'

interface GetUserOrdersDeps {
  repo: OrderRepository
  authenticatedUserId: string
  userRole: string
}

/**
 * Caso de uso: Obtener todos los pedidos de un usuario
 * - Solo el propio usuario o un admin pueden ver sus pedidos
 */
export async function getUserOrders(
  userId: string,
  deps: GetUserOrdersDeps
): Promise<Order[]> {
  const { repo, authenticatedUserId, userRole } = deps

  // Verificar permisos
  const isOwnOrders = userId === authenticatedUserId
  const isAdmin = userRole === 'ADMIN'

  if (!isOwnOrders && !isAdmin) {
    throw new Error('No tienes permisos para ver los pedidos de otro usuario')
  }

  const orders = await repo.findByUserId(userId, true)

  return orders
}
