import type { ServiceRepository } from '../domain/repositories/service-repository'
import { verifyWorkshopOwnership, verifyEntityExists } from '@/lib/authorization'

interface DeleteServiceDeps {
  repo: ServiceRepository
  authenticatedUserId: string
}

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

/**
 * Caso de uso: Eliminar un servicio
 * - Solo el dueño del taller puede eliminar sus servicios
 */
export async function deleteService(
  serviceId: string,
  deps: DeleteServiceDeps & { workshopRepo: WorkshopRepository }
): Promise<void> {
  const { repo, workshopRepo, authenticatedUserId } = deps

  // Obtener el servicio actual usando helper compartido
  const service = await repo.findById(serviceId)
  verifyEntityExists(service, 'Servicio')

  // Verificar que el taller existe y que el usuario es el dueño usando helper compartido
  await verifyWorkshopOwnership(service.workshopId, authenticatedUserId, workshopRepo)

  // Eliminar el servicio
  await repo.delete(serviceId)
}
