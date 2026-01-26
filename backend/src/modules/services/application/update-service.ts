import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { Service, UpdateServiceInput } from '../domain/entities/service'
import { verifyWorkshopOwnership, verifyEntityExists } from '../../../lib/authorization'

interface UpdateServiceDeps {
  repo: ServiceRepository
  authenticatedUserId: string
}

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

/**
 * Caso de uso: Actualizar un servicio
 * - Solo el dueño del taller puede actualizar sus servicios
 */
export async function updateService(
  serviceId: string,
  data: UpdateServiceInput,
  deps: UpdateServiceDeps & { workshopRepo: WorkshopRepository }
): Promise<Service> {
  const { repo, workshopRepo, authenticatedUserId } = deps

  // Obtener el servicio actual usando helper compartido
  const service = await repo.findById(serviceId)
  verifyEntityExists(service, 'Servicio')

  // Verificar que el taller existe y que el usuario es el dueño usando helper compartido
  await verifyWorkshopOwnership(service.workshopId, authenticatedUserId, workshopRepo)

  // Si se está cambiando la categoría, verificar que existe usando helper compartido
  if (data.serviceCategoryId) {
    const category = await repo.findCategoryById(data.serviceCategoryId)
    verifyEntityExists(category, 'Categoría de servicio')
  }

  // Actualizar el servicio
  const updatedService = await repo.update(serviceId, data)

  return updatedService
}
