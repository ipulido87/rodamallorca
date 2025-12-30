import { OrderStatus } from '../domain/enums/order-status'
import type { Order, UpdateOrderStatusInput } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'
import { billingRepositoryPrisma } from '../../billing/infrastructure/persistence/prisma/billing-repository-prisma'
import { generateInvoiceFromOrder } from '../../billing/application/generate-invoice-from-order'
import { sendInvoiceEmail } from '../../notifications/services/email-service'
import prisma from '../../../lib/prisma'

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

  // 🎯 AUTO-FACTURACIÓN: Generar factura automáticamente cuando se confirma el pedido
  if (input.status === OrderStatus.CONFIRMED && order.status !== OrderStatus.CONFIRMED) {
    try {
      const invoice = await generateInvoiceFromOrder(orderId, {
        billingRepo: billingRepositoryPrisma,
      })
      console.log(`✅ [AUTO-INVOICE] Factura generada automáticamente para pedido ${orderId}`)

      // 📧 Enviar email al cliente con la factura
      setImmediate(async () => {
        try {
          // Obtener datos completos del pedido y factura
          const fullOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              user: true,
              workshop: true,
              items: true,
            },
          })

          if (!fullOrder) return

          const fullInvoice = await prisma.invoice.findUnique({
            where: { id: invoice.id },
          })

          if (!fullInvoice) return

          const orderNumber = fullOrder.id.slice(0, 8).toUpperCase()
          const invoiceNumber = fullInvoice.invoiceNumber // Ya viene formateado (ej: "F-2025-001")
          const totalAmount = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
          }).format(fullOrder.totalAmount / 100)

          await sendInvoiceEmail({
            customerName: fullOrder.user.name || fullOrder.user.email,
            customerEmail: fullOrder.user.email,
            workshopName: fullOrder.workshop.name,
            orderNumber,
            invoiceNumber,
            totalAmount,
            itemsCount: fullOrder.items.length,
            invoiceUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders/${orderId}`,
          })

          console.log(`✅ [EMAIL] Email de factura enviado al cliente ${fullOrder.user.email}`)
        } catch (emailError) {
          console.error('❌ [EMAIL] Error enviando email de factura:', emailError)
        }
      })
    } catch (error) {
      console.error(`❌ [AUTO-INVOICE] Error generando factura para pedido ${orderId}:`, error)
      // No lanzar error para no bloquear la confirmación del pedido
      // La factura se puede generar manualmente después si falla
    }
  }

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
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
    [OrderStatus.IN_PROGRESS]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  }

  const allowedStatuses = validTransitions[currentStatus]

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error(`No se puede cambiar de ${currentStatus} a ${newStatus}`)
  }
}
