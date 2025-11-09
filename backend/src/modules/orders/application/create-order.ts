import type { CreateOrderInput, Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'

interface CreateOrderDeps {
  repo: OrderRepository
  authenticatedUserId: string
}

/**
 * Caso de uso: Crear un nuevo pedido
 * - Valida que el usuario autenticado sea quien crea el pedido
 * - Calcula el total basado en los items
 * - Crea el pedido con estado PENDING
 */
export async function createOrder(
  input: CreateOrderInput,
  deps: CreateOrderDeps
): Promise<Order> {
  const { repo, authenticatedUserId } = deps

  // Validar que el usuario autenticado sea quien crea el pedido
  if (input.userId !== authenticatedUserId) {
    throw new Error('No tienes permisos para crear pedidos en nombre de otro usuario')
  }

  // Validar que haya al menos un item
  if (!input.items || input.items.length === 0) {
    throw new Error('El pedido debe tener al menos un item')
  }

  // Validar que todos los items tengan cantidad > 0
  for (const item of input.items) {
    if (item.quantity <= 0) {
      throw new Error('La cantidad de cada item debe ser mayor a 0')
    }
    if (item.priceAtOrder <= 0) {
      throw new Error('El precio de cada item debe ser mayor a 0')
    }
  }

  // Calcular el total
  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.priceAtOrder * item.quantity,
    0
  )

  // Crear el pedido
  const order = await repo.create({
    ...input,
    items: input.items.map((item) => ({
      ...item,
      currency: item.currency ?? 'EUR',
    })),
  })

  return order
}
