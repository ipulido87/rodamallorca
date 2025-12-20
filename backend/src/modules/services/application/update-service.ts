import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { Service, UpdateServiceInput } from '../domain/entities/service'

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

  // Obtener el servicio actual
  const service = await repo.findById(serviceId)

  if (!service) {
    throw new Error('Servicio no encontrado')
  }

  // Verificar que el taller existe y que el usuario es el dueño
  const workshop = await workshopRepo.findById(service.workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (workshop.ownerId !== authenticatedUserId) {
    throw new Error('No tienes permisos para actualizar este servicio')
  }

  // Si se está cambiando la categoría, verificar que existe
  if (data.serviceCategoryId) {
    const category = await repo.findCategoryById(data.serviceCategoryId)

    if (!category) {
      throw new Error('Categoría de servicio no encontrada')
    }
  }

  // Actualizar el servicio
  const updatedService = await repo.update(serviceId, data)

  return updatedService
}
