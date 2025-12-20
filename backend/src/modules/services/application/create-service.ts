import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { Service, CreateServiceInput } from '../domain/entities/service'

interface CreateServiceDeps {
  repo: ServiceRepository
  authenticatedUserId: string
}

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

/**
 * Caso de uso: Crear un nuevo servicio
 * - Solo el dueño del taller puede crear servicios
 */
export async function createService(
  data: CreateServiceInput,
  deps: CreateServiceDeps & { workshopRepo: WorkshopRepository }
): Promise<Service> {
  const { repo, workshopRepo, authenticatedUserId } = deps

  // Verificar que el taller existe y que el usuario es el dueño
  const workshop = await workshopRepo.findById(data.workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (workshop.ownerId !== authenticatedUserId) {
    throw new Error('No tienes permisos para crear servicios en este taller')
  }

  // Verificar que la categoría de servicio existe
  const category = await repo.findCategoryById(data.serviceCategoryId)

  if (!category) {
    throw new Error('Categoría de servicio no encontrada')
  }

  // Crear el servicio
  const service = await repo.create(data)

  return service
}
