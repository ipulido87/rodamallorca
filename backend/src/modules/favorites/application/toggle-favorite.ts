import type { FavoriteRepository } from '../domain/repositories/favorite-repository'
import type { FavoriteWorkshop } from '../domain/entities/favorite'

interface ToggleFavoriteDeps {
  repo: FavoriteRepository
  userId: string
}

/**
 * Caso de uso: Agregar o quitar un taller de favoritos
 * - Si ya existe, lo elimina
 * - Si no existe, lo agrega
 */
export async function toggleFavorite(
  workshopId: string,
  deps: ToggleFavoriteDeps
): Promise<{ added: boolean; favorite?: FavoriteWorkshop }> {
  const { repo, userId } = deps

  const exists = await repo.exists(userId, workshopId)

  if (exists) {
    await repo.delete(userId, workshopId)
    return { added: false }
  } else {
    const favorite = await repo.create({ userId, workshopId })
    return { added: true, favorite }
  }
}
