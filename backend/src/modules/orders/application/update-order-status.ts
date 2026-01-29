import { OrderStatus } from '../domain/enums/order-status'
import type { Order, UpdateOrderStatusInput } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'
import type { BillingRepository } from '../../billing/domain/repositories/billing-repository'
import { generateInvoiceFromOrder } from '../../billing/application/generate-invoice-from-order'
import { sendInvoiceEmail, sendOrderStatusUpdateEmail } from '../../notifications/services/email-service'
import { verifyEntityExists, verifyWorkshopOwnership } from '../../../lib/authorization'

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

interface UpdateOrderStatusDeps {
  repo: OrderRepository
  workshopRepo: WorkshopRepository
  billingRepo: BillingRepository
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
  const { repo, workshopRepo, billingRepo, authenticatedUserId, userRole } = deps

  // Obtener el pedido actual usando helper compartido
  const order = await repo.findById(orderId, false)
  verifyEntityExists(order, 'Pedido')

  // Verificar permisos - solo el dueño del taller puede actualizar, usando helper compartido
  // (admin también tiene acceso pero primero validamos el workshop)
  if (userRole !== 'ADMIN') {
    await verifyWorkshopOwnership(order.workshopId, authenticatedUserId, workshopRepo)
  }

  // Validar transiciones de estado
  validateStatusTransition(order.status, input.status)

  // Actualizar el estado
  const updatedOrder = await repo.updateStatus(orderId, input)

  // 🎯 AUTO-FACTURACIÓN: Generar factura automáticamente cuando se confirma el pedido
  if (input.status === OrderStatus.CONFIRMED && order.status !== OrderStatus.CONFIRMED) {
    try {
      const invoice = await generateInvoiceFromOrder(orderId, {
        billingRepo,
        orderRepo: repo,
      })
      console.log(`✅ [AUTO-INVOICE] Factura generada automáticamente para pedido ${orderId}`)

      // 📧 Enviar email al cliente con la factura
      setImmediate(async () => {
        try {
          // Obtener datos completos del pedido y factura usando repositorios
          const fullOrder = await repo.findByIdWithDetails(orderId)

          if (!fullOrder) return

          const fullInvoice = await billingRepo.findInvoiceByIdWithDetails(invoice.id)

          if (!fullInvoice) return

          const orderNumber = fullOrder.id.slice(0, 8).toUpperCase()
          const invoiceNumber = fullInvoice.invoiceNumber // Ya viene formateado (ej: "F-2025-001")
          const totalAmount = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
          }).format(fullOrder.totalAmount / 100)

          // Preparar items para el PDF
          const invoiceItems = fullInvoice.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: Number(item.quantity), // Convert Decimal to number
            unitPrice: item.unitPrice,
            total: item.total || 0,
          }))

          await sendInvoiceEmail({
            customerName: fullOrder.user.name || fullOrder.user.email,
            customerEmail: fullOrder.user.email,
            workshopName: fullOrder.workshop.name,
            workshopAddress: fullOrder.workshop.address || undefined,
            workshopCity: fullOrder.workshop.city || undefined,
            workshopTaxId: undefined, // Workshop doesn't have taxId field yet
            workshopPhone: fullOrder.workshop.phone || undefined,
            orderNumber,
            invoiceNumber,
            issueDate: fullInvoice.issueDate.toISOString(),
            totalAmount,
            subtotal: fullInvoice.subtotal,
            taxAmount: fullInvoice.taxAmount,
            total: fullInvoice.total,
            itemsCount: fullOrder.items.length,
            items: invoiceItems,
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

  // 🔔 NOTIFICACIONES: Enviar emails al cliente cuando cambia el estado
  // Solo para cambios relevantes (IN_PROGRESS, READY, COMPLETED)
  const notifiableStatuses = [OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.COMPLETED]

  if (notifiableStatuses.includes(input.status) && order.status !== input.status) {
    setImmediate(async () => {
      try {
        const fullOrder = await repo.findByIdWithDetails(orderId)

        if (!fullOrder) return

        const orderNumber = fullOrder.id.slice(0, 8).toUpperCase()
        const customerName = fullOrder.user.name || fullOrder.user.email

        // Mensajes según el estado
        const statusMessages: Record<string, string> = {
          [OrderStatus.IN_PROGRESS]: '¡Tu pedido está en progreso! Nuestro equipo está trabajando en él.',
          [OrderStatus.READY]: '¡Tu pedido está listo para recoger! Puedes pasar a buscarlo cuando quieras.',
          [OrderStatus.COMPLETED]: '¡Tu pedido ha sido completado! Gracias por tu compra.',
        }

        await sendOrderStatusUpdateEmail({
          customerName,
          customerEmail: fullOrder.user.email,
          workshopName: fullOrder.workshop.name,
          orderNumber,
          newStatus: input.status,
          statusMessage: statusMessages[input.status] || 'Tu pedido ha sido actualizado.',
          orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${orderId}`,
        })

        console.log(`✅ [NOTIFICATIONS] Email de actualización enviado para pedido ${orderNumber} - Estado: ${input.status}`)
      } catch (error) {
        console.error('❌ [NOTIFICATIONS] Error enviando email de actualización:', error)
      }
    })
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
