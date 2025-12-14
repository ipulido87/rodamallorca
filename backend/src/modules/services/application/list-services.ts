import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { Service, VehicleType, ServiceStatus } from '../domain/entities/service'

interface ListServicesDeps {
  repo: ServiceRepository
}

/**
 * Caso de uso: Listar servicios (catálogo público)
 */
export async function listServices(
  filters: {
    workshopId?: string
    serviceCategoryId?: string
    vehicleType?: VehicleType
    status?: ServiceStatus
    city?: string
  },
  deps: ListServicesDeps
): Promise<Service[]> {
  const { repo } = deps

  const services = await repo.search(filters)

  return services
}

/**
 * Caso de uso: Listar servicios de un taller
 */
export async function listWorkshopServices(
  workshopId: string,
  deps: ListServicesDeps
): Promise<Service[]> {
  const { repo } = deps

  const services = await repo.findByWorkshopId(workshopId)

  return services
}
