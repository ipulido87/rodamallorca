import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { Service, CreateServiceInput } from '../domain/entities/service'
import { verifyWorkshopOwnership, verifyEntityExists } from '@/lib/authorization'

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

  // Verificar que el taller existe y que el usuario es el dueño usando helper compartido
  await verifyWorkshopOwnership(data.workshopId, authenticatedUserId, workshopRepo)

  // Verificar que la categoría de servicio existe usando helper compartido
  const category = await repo.findCategoryById(data.serviceCategoryId)
  verifyEntityExists(category, 'Categoría de servicio')

  // Crear el servicio
  const service = await repo.create(data)

  return service
}
