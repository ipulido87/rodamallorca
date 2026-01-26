import { ERRORS } from '../errors/error-messages'

/**
 * Interfaz mínima para repositorios de workshop
 * Solo requiere el método findById que devuelve id y ownerId
 */
export interface MinimalWorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

/**
 * Verifica que un usuario sea propietario de un taller
 * @throws Error si el taller no existe o el usuario no es propietario
 */
export async function verifyWorkshopOwnership(
  workshopId: string,
  userId: string,
  workshopRepo: MinimalWorkshopRepository
): Promise<void> {
  const workshop = await workshopRepo.findById(workshopId)

  if (!workshop) {
    throw new Error(ERRORS.WORKSHOP_NOT_FOUND)
  }

  if (workshop.ownerId !== userId) {
    throw new Error(ERRORS.NOT_WORKSHOP_OWNER)
  }
}

/**
 * Obtiene un taller y verifica que el usuario sea propietario
 * @throws Error si el taller no existe o el usuario no es propietario
 * @returns El taller encontrado
 */
export async function getWorkshopAndVerifyOwnership<T extends { id: string; ownerId: string }>(
  workshopId: string,
  userId: string,
  workshopRepo: MinimalWorkshopRepository
): Promise<T> {
  const workshop = await workshopRepo.findById(workshopId)

  if (!workshop) {
    throw new Error(ERRORS.WORKSHOP_NOT_FOUND)
  }

  if (workshop.ownerId !== userId) {
    throw new Error(ERRORS.NOT_WORKSHOP_OWNER)
  }

  return workshop as T
}
