import type { CreateOrderInput, Order } from '../domain/entities/order'
import type {
  OrderRepository,
  CreateOrderRepoInput,
} from '../domain/repositories/order-repository'
import type { WorkshopRepository } from '../../../modules/workshops/domain/repositories/workshop-repository'

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
  }

  const items = input.items.map((i) => ({
    productId: i.productId ?? null,
    quantity: i.quantity,
    priceAtOrder: i.priceAtOrder,
    currency: i.currency ?? 'EUR',
    description: i.description ?? null,
  }))

  const totalAmount = items.reduce(
    (acc, it) => acc + it.priceAtOrder * it.quantity,
    0
  )

  const payload: CreateOrderRepoInput = {
    userId: input.userId,
    workshopId: input.workshopId,
    notes: input.notes ?? null,
    totalAmount,
    items,
  }

  return repo.create(payload)
}
