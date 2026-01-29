import { OrderStatus } from '../domain/enums/order-status'
import type { Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'
import { verifyEntityExists, verifyAdminOrOwner } from '../../../lib/authorization'
import { sendOrderCancelledEmail } from '../../notifications/services/email-service'

interface CancelOrderDeps {
  repo: OrderRepository
  authenticatedUserId: string
  userRole: string
  cancellationReason?: string
}

/**
 * Caso de uso: Cancelar un pedido
 * - El cliente que creó el pedido puede cancelarlo
 * - El dueño del taller también puede cancelarlo
 * - Solo si el pedido aún no está completado o cancelado
 * - Envía notificaciones por email a ambas partes
 */
export async function cancelOrder(
  orderId: string,
  deps: CancelOrderDeps
): Promise<Order> {
  const { repo, authenticatedUserId, userRole, cancellationReason } = deps

  // Obtener el pedido actual usando helper compartido
  const order = await repo.findById(orderId, false)
  verifyEntityExists(order, 'Pedido')

  // Verificar permisos usando helper compartido
  verifyAdminOrOwner(order.userId, authenticatedUserId, userRole)

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

  // 🔔 NOTIFICACIONES: Enviar emails de forma asíncrona
  // No bloqueamos la respuesta si las notificaciones fallan
  setImmediate(async () => {
    try {
      // Obtener datos completos del pedido para las notificaciones
      const fullOrder = await repo.findByIdWithDetails(orderId)

      if (!fullOrder) {
        console.warn(`⚠️  [NOTIFICATIONS] No se pudo obtener datos del pedido ${orderId} para notificaciones`)
        return
      }

      const workshopOwnerEmail = fullOrder.workshop.owner.email
      const customerName = fullOrder.user.name || fullOrder.user.email
      const orderNumber = fullOrder.id.slice(0, 8).toUpperCase()

      // Enviar emails de cancelación
      await sendOrderCancelledEmail({
        workshopName: fullOrder.workshop.name,
        workshopOwnerEmail,
        customerName,
        customerEmail: fullOrder.user.email,
        orderNumber,
        cancellationReason,
        orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${orderId}`,
      })

      console.log(`✅ [NOTIFICATIONS] Notificaciones de cancelación enviadas para pedido ${orderNumber}`)
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error enviando notificaciones de cancelación:', error)
    }
  })

  return cancelledOrder
}
