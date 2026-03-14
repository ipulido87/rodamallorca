import { ERRORS } from '../errors/error-messages'

/**
 * Validadores comunes reutilizables
 */

/**
 * Valida que un rating esté en el rango correcto (1-5)
 * @throws Error si el rating no está entre 1 y 5
 */
export function validateRating(rating: number): void {
  if (rating < 1 || rating > 5) {
    throw new Error(ERRORS.INVALID_RANGE('Rating', 1, 5))
  }
}

/**
 * Interfaz genérica para repositorios que buscan por email
 */
export interface EmailRepository<T> {
  findByEmail(workshopId: string, email: string): Promise<T | null>
}

/**
 * Valida que un email sea único en el contexto de un workshop
 * @param email - Email a validar
 * @param workshopId - ID del workshop
 * @param repository - Repositorio que implementa findByEmail
 * @param excludeId - ID de entidad a excluir (útil en updates)
 * @throws Error si ya existe una entidad con ese email
 */
export async function validateUniqueEmail<T extends { id: string }>(
  email: string | null | undefined,
  workshopId: string,
  repository: EmailRepository<T>,
  excludeId?: string
): Promise<void> {
  if (!email) return

  const existing = await repository.findByEmail(workshopId, email)

  if (existing && existing.id !== excludeId) {
    throw new Error(ERRORS.ALREADY_EXISTS('email'))
  }
}

/**
 * Interfaz genérica para repositorios que buscan por taxId
 */
export interface TaxIdRepository<T> {
  findByTaxId(workshopId: string, taxId: string): Promise<T | null>
}

/**
 * Valida que un NIF/CIF sea único en el contexto de un workshop
 * @param taxId - NIF/CIF a validar
 * @param workshopId - ID del workshop
 * @param repository - Repositorio que implementa findByTaxId
 * @param excludeId - ID de entidad a excluir (útil en updates)
 * @throws Error si ya existe una entidad con ese taxId
 */
export async function validateUniqueTaxId<T extends { id: string }>(
  taxId: string | null | undefined,
  workshopId: string,
  repository: TaxIdRepository<T>,
  excludeId?: string
): Promise<void> {
  if (!taxId) return

  const existing = await repository.findByTaxId(workshopId, taxId)

  if (existing && existing.id !== excludeId) {
    throw new Error(ERRORS.ALREADY_EXISTS('NIF/CIF'))
  }
}

/**
 * Valida que un valor numérico esté dentro de un rango
 * @throws Error si el valor está fuera del rango
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new Error(ERRORS.INVALID_RANGE(fieldName, min, max))
  }
}
