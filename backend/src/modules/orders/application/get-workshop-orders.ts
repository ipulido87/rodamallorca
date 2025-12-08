import type { Order } from '../domain/entities/order'
import type { OrderRepository } from '../domain/repositories/order-repository'

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

interface GetWorkshopOrdersDeps {
  repo: OrderRepository
  workshopRepo: WorkshopRepository
  authenticatedUserId: string
  userRole: string
}

/**
 * Caso de uso: Obtener todos los pedidos de un taller
 * - Solo el dueño del taller o un admin pueden ver los pedidos
 */
export async function getWorkshopOrders(
  workshopId: string,
  deps: GetWorkshopOrdersDeps
): Promise<Order[]> {
  const { repo, workshopRepo, authenticatedUserId, userRole } = deps

  // Verificar que el taller existe y obtener el dueño
  const workshop = await workshopRepo.findById(workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  // Verificar permisos
  const isWorkshopOwner = workshop.ownerId === authenticatedUserId
  const isAdmin = userRole === 'ADMIN'

  if (!isWorkshopOwner && !isAdmin) {
    throw new Error('No tienes permisos para ver los pedidos de este taller')
  }

  const orders = await repo.findByWorkshopId(workshopId, true)

  return orders
}
