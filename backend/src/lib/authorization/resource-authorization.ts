import { ERRORS } from '../errors/error-messages'

/**
 * Verifica que una entidad existe
 * @throws Error si la entidad no existe
 */
export function verifyEntityExists<T>(entity: T | null | undefined, entityName: string): asserts entity is T {
  if (!entity) {
    throw new Error(ERRORS.NOT_FOUND(entityName))
  }
}

/**
 * Verifica que un recurso pertenece a un workshop específico
 * @throws Error si el recurso no pertenece al workshop
 */
export function verifyResourceBelongsToWorkshop(
  resourceWorkshopId: string,
  expectedWorkshopId: string,
  resourceName: string
): void {
  if (resourceWorkshopId !== expectedWorkshopId) {
    throw new Error(ERRORS.NO_PERMISSION(`acceder a este ${resourceName}`))
  }
}

/**
 * Verifica permisos de administrador o propietario
 * @returns true si el usuario tiene permisos
 */
export function verifyAdminOrOwner(
  resourceUserId: string,
  authenticatedUserId: string,
  userRole: string,
  workshopOwnerId?: string
): void {
  const isOwner = resourceUserId === authenticatedUserId
  const isWorkshopOwner = workshopOwnerId && workshopOwnerId === authenticatedUserId
  const isAdmin = userRole === 'ADMIN'

  if (!isOwner && !isWorkshopOwner && !isAdmin) {
    throw new Error(ERRORS.NOT_RESOURCE_OWNER)
  }
}

/**
 * Obtiene una entidad y verifica que pertenece al workshop
 * @throws Error si la entidad no existe o no pertenece al workshop
 */
export function getEntityAndVerifyWorkshop<T extends { workshopId: string }>(
  entity: T | null,
  entityName: string,
  expectedWorkshopId: string
): T {
  verifyEntityExists(entity, entityName)
  verifyResourceBelongsToWorkshop(entity.workshopId, expectedWorkshopId, entityName)
  return entity
}
