import { OrderStatus } from '@prisma/client'
import type { Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'

interface CancelOrderDeps {
  repo: OrderRepository
  authenticatedUserId: string
  userRole: string
}

/**
 * Caso de uso: Cancelar un pedido
 * - El cliente que creó el pedido puede cancelarlo
 * - El dueño del taller también puede cancelarlo
 * - Solo si el pedido aún no está completado o cancelado
 */
export async function cancelOrder(
  orderId: string,
  deps: CancelOrderDeps
): Promise<Order> {
  const { repo, authenticatedUserId, userRole } = deps

  // Obtener el pedido actual
  const order = await repo.findById(orderId, false)

  if (!order) {
    throw new Error('Pedido no encontrado')
  }

  // Verificar permisos - el cliente o admin pueden cancelar
  const isOrderOwner = order.userId === authenticatedUserId
  const isAdmin = userRole === 'ADMIN'

  if (!isOrderOwner && !isAdmin) {
    throw new Error('No tienes permisos para cancelar este pedido')
  }

  // Validar que el pedido pueda ser cancelado
  if (order.status === OrderStatus.COMPLETED) {
    throw new Error('No se puede cancelar un pedido que ya está completado')
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error('El pedido ya está cancelado')
  }

  // Cancelar el pedido
  const cancelledOrder = await repo.updateStatus(orderId, {
    status: OrderStatus.CANCELLED,
  })

  return cancelledOrder
}
