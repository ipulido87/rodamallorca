import type { RentalRepository } from '../domain/repositories/rental-repository'
import type { RentalBike, RentalFilters } from '../domain/entities/rental-bike'
import { checkAvailability } from '../services/rental-availability.service'

interface GetRentalBikesDeps {
  rentalRepo: RentalRepository
}

/**
 * Caso de uso: Obtener lista de bicicletas de alquiler
 *
 * Aplica filtros y verifica disponibilidad si se proporcionan fechas
 */
export async function getRentalBikes(
  filters: RentalFilters,
  deps: GetRentalBikesDeps
): Promise<{ bikes: RentalBike[]; total: number }> {
  const { rentalRepo } = deps

  // Obtener bicis con filtros basicos
  const bikes = await rentalRepo.findRentalBikes(filters)

  // Si hay fechas, filtrar por disponibilidad
  let filteredBikes = bikes
  if (filters.startDate && filters.endDate) {
    const availabilityChecks = await Promise.all(
      bikes.map(async (bike) => {
        const availability = await checkAvailability({
          productId: bike.id,
          startDate: filters.startDate!,
          endDate: filters.endDate!,
        })
        return { bike, available: availability.available }
      })
    )

    filteredBikes = availabilityChecks
      .filter((item) => item.available)
      .map((item) => item.bike)
  }

  return {
    bikes: filteredBikes,
    total: filteredBikes.length,
  }
}
