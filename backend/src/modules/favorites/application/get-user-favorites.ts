import type { FavoriteRepository } from '../domain/repositories/favorite-repository'
import type { FavoriteWorkshop } from '../domain/entities/favorite'

interface GetUserFavoritesDeps {
  repo: FavoriteRepository
  authenticatedUserId: string
}

/**
 * Caso de uso: Obtener todos los talleres favoritos de un usuario
 */
export async function getUserFavorites(
  userId: string,
  deps: GetUserFavoritesDeps
): Promise<FavoriteWorkshop[]> {
  const { repo, authenticatedUserId } = deps

  // Solo el propio usuario puede ver sus favoritos
  if (userId !== authenticatedUserId) {
    throw new Error('No tienes permisos para ver estos favoritos')
  }

  return await repo.findByUser(userId)
}
