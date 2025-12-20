import type { ServiceRepository } from '../domain/repositories/service-repository'
import type { ServiceCategory } from '../domain/entities/service'

interface ListServiceCategoriesDeps {
  repo: ServiceRepository
}

/**
 * Caso de uso: Listar todas las categorías de servicios
 */
export async function listServiceCategories(
  deps: ListServiceCategoriesDeps
): Promise<ServiceCategory[]> {
  const { repo } = deps

  const categories = await repo.findAllCategories()

  return categories
}
