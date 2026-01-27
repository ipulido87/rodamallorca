import type { CreateOrderInput, Order } from '../domain/entities/order'
import type {
  OrderRepository,
  CreateOrderRepoInput,
} from '../domain/repositories/order-repository'
import type { WorkshopRepository } from '../../../modules/workshops/domain/repositories/workshop-repository'
import { sendNewOrderEmail } from '../../notifications/services/email-service'
import { sendNewOrderPush } from '../../notifications/services/push-service'
import { checkAvailability } from '../../rentals/services/rental-availability.service'

interface CreateOrderDeps {
  repo: OrderRepository
  workshopRepo: WorkshopRepository
  authenticatedUserId: string
}

export async function createOrder(
  input: CreateOrderInput,
  { repo, workshopRepo, authenticatedUserId }: CreateOrderDeps
): Promise<Order> {
  if (input.userId !== authenticatedUserId) {
    throw new Error(
      'No tienes permisos para crear pedidos en nombre de otro usuario'
    )
  }

  // Verificar que el taller existe
  const workshop = await workshopRepo.findById(input.workshopId)
  if (!workshop) {
    throw new Error('El taller especificado no existe')
  }

  if (!input.items?.length) {
    throw new Error('El pedido debe tener al menos un item')
  }

  for (const item of input.items) {
    if (item.quantity <= 0) {
      throw new Error('La cantidad de cada item debe ser mayor a 0')
    }
    if (item.priceAtOrder <= 0) {
      throw new Error('El precio de cada item debe ser mayor a 0')
    }

    // ✅ VALIDACIÓN DE DISPONIBILIDAD PARA ALQUILERES
    if (item.isRental && item.productId && item.rentalStartDate && item.rentalEndDate) {
      const availability = await checkAvailability({
        productId: item.productId,
        startDate: new Date(item.rentalStartDate),
        endDate: new Date(item.rentalEndDate),
        quantity: item.quantity,
      })

      if (!availability.available) {
        throw new Error(
          `El producto no está disponible para las fechas seleccionadas. Disponibilidad: ${availability.availableQuantity} unidades`
        )
      }
    }
  }

  const items = input.items.map((i) => ({
    productId: i.productId ?? null,
    quantity: i.quantity,
    priceAtOrder: i.priceAtOrder,
    currency: i.currency ?? 'EUR',
    description: i.description ?? null,
    // Campos de alquiler
    isRental: i.isRental ?? false,
    rentalStartDate: i.rentalStartDate ? new Date(i.rentalStartDate) : null,
    rentalEndDate: i.rentalEndDate ? new Date(i.rentalEndDate) : null,
    rentalDays: i.rentalDays ?? null,
    depositPaid: i.depositPaid ?? null,
  }))

  const totalAmount = items.reduce(
    (acc, it) => acc + it.priceAtOrder * it.quantity,
    0
  )

  // Determinar el tipo de orden basado en los items
  const hasRentals = items.some(item => item.isRental)
  const orderType = input.type || (hasRentals ? 'RENTAL' : 'PRODUCT_ORDER')

  const payload: CreateOrderRepoInput = {
    userId: input.userId,
    workshopId: input.workshopId,
    notes: input.notes ?? null,
    totalAmount,
    items,
    type: orderType,
  }

  // Crear el pedido
  const order = await repo.create(payload)

  // 🔔 NOTIFICACIONES: Enviar email y push notification al taller de forma asíncrona
  // No bloqueamos la respuesta si las notificaciones fallan
  setImmediate(async () => {
    try {
      // Obtener datos completos del pedido, workshop y usuario para las notificaciones
      const fullOrder = await repo.findByIdWithDetails(order.id)

      if (!fullOrder) return

      const workshopOwnerEmail = fullOrder.workshop.owner.email
      const customerName = fullOrder.user.name || fullOrder.user.email
      const orderNumber = fullOrder.id.slice(0, 8).toUpperCase()
      const totalAmount = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(fullOrder.totalAmount / 100)

      // Enviar email
      await sendNewOrderEmail({
        workshopName: fullOrder.workshop.name,
        workshopOwnerEmail,
        orderNumber,
        customerName,
        customerEmail: fullOrder.user.email,
        totalAmount,
        itemsCount: fullOrder.items.length,
        orderUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/workshop-orders`,
      })

      // Enviar push notification
      await sendNewOrderPush(fullOrder.workshopId, {
        orderNumber,
        customerName,
        totalAmount,
        itemsCount: fullOrder.items.length,
      })

      console.log(`✅ [NOTIFICATIONS] Notificaciones enviadas para pedido ${orderNumber}`)
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Error enviando notificaciones:', error)
    }
  })

  return order
}
