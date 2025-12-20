import type { ServiceRepository } from '../domain/repositories/service-repository'

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
    throw new Error('No tienes permisos para eliminar este servicio')
  }

  // Eliminar el servicio
  await repo.delete(serviceId)
}
