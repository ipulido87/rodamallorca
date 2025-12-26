import { Request, Response, NextFunction } from 'express'
import { toggleFavorite } from '../../application/toggle-favorite'
import { getUserFavorites } from '../../application/get-user-favorites'
import { favoriteRepositoryPrisma } from '../../infrastructure/persistence/prisma/favorite-repository-prisma'

/**
 * POST /api/favorites/:workshopId
 * Toggle favorito (agregar o quitar)
 */
export const toggleFavoriteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params

    const result = await toggleFavorite(workshopId, {
      repo: favoriteRepositoryPrisma,
      userId: req.user.id,
    })

    res.json(result)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/favorites
 * Obtener favoritos del usuario autenticado
 */
export const getUserFavoritesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const favorites = await getUserFavorites(req.user.id, {
      repo: favoriteRepositoryPrisma,
      authenticatedUserId: req.user.id,
    })

    res.json(favorites)
  } catch (e) {
    next(e)
  }
}

/**
 * GET /api/favorites/check/:workshopId
 * Verificar si un taller es favorito
 */
export const checkFavoriteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    const { workshopId } = req.params

    const isFavorite = await favoriteRepositoryPrisma.exists(
      req.user.id,
      workshopId
    )

    res.json({ isFavorite })
  } catch (e) {
    next(e)
  }
}
