import type { RentalRepository } from '../domain/repositories/rental-repository'
import type { RentalBike } from '../domain/entities/rental-bike'

interface GetRentalBikeDetailsDeps {
  rentalRepo: RentalRepository
}

/**
 * Caso de uso: Obtener detalles de una bicicleta de alquiler
 */
export async function getRentalBikeDetails(
  bikeId: string,
  deps: GetRentalBikeDetailsDeps
): Promise<RentalBike | null> {
  const { rentalRepo } = deps

  const bike = await rentalRepo.findRentalBikeById(bikeId)

  // Solo retornar si es una bici de alquiler
  if (!bike) {
    return null
  }

  return bike
}
