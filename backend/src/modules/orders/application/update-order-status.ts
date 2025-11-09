import { OrderStatus } from '@prisma/client'
import type { Order, UpdateOrderStatusInput } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

interface UpdateOrderStatusDeps {
  repo: OrderRepository
  workshopRepo: WorkshopRepository
  authenticatedUserId: string
  userRole: string
}

/**
 * Caso de uso: Actualizar el estado de un pedido
 * - Solo el dueño del taller puede cambiar el estado
 * - Valida transiciones de estado válidas
 */
export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput,
  deps: UpdateOrderStatusDeps
): Promise<Order> {
  const { repo, workshopRepo, authenticatedUserId, userRole } = deps

  // Obtener el pedido actual
  const order = await repo.findById(orderId, false)

  if (!order) {
    throw new Error('Pedido no encontrado')
  }

  // Verificar que el taller existe y obtener el dueño
  const workshop = await workshopRepo.findById(order.workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  // Verificar permisos - solo el dueño del taller puede actualizar
  const isWorkshopOwner = workshop.ownerId === authenticatedUserId
  const isAdmin = userRole === 'ADMIN'

  if (!isWorkshopOwner && !isAdmin) {
    throw new Error('No tienes permisos para actualizar este pedido')
  }

  // Validar transiciones de estado
  validateStatusTransition(order.status, input.status)

  // Actualizar el estado
  const updatedOrder = await repo.updateStatus(orderId, input)

  return updatedOrder
}

/**
 * Valida que la transición de estado sea válida
 */
function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): void {
  // No permitir cambiar si ya está completado o cancelado
  if (
    currentStatus === OrderStatus.COMPLETED ||
    currentStatus === OrderStatus.CANCELLED
  ) {
    throw new Error(
      'No se puede modificar un pedido que ya está completado o cancelado'
    )
  }

  // Validar flujo normal: PENDING -> CONFIRMED -> IN_PROGRESS -> READY -> COMPLETED
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.CONFIRMED]: [
      OrderStatus.IN_PROGRESS,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.IN_PROGRESS]: [
      OrderStatus.READY,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.READY]: [
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  }

  const allowedStatuses = validTransitions[currentStatus]

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(
      `No se puede cambiar de ${currentStatus} a ${newStatus}`
    )
  }
}
