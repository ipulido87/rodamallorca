import type { RentalRepository } from '../domain/repositories/rental-repository'
import type { RentalFilterOptions } from '../domain/entities/rental-bike'

interface GetRentalFiltersDeps {
  rentalRepo: RentalRepository
}

/**
 * Caso de uso: Obtener opciones de filtros para alquileres
 *
 * Retorna las ciudades, tipos de bici y rango de precios disponibles
 */
export async function getRentalFilters(
  deps: GetRentalFiltersDeps
): Promise<RentalFilterOptions> {
  const { rentalRepo } = deps

  return rentalRepo.getFilterOptions()
}
