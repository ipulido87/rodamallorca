import { Router } from 'express'
import { verifyToken } from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  toggleFavoriteController,
  getUserFavoritesController,
  checkFavoriteController,
} from '../controllers/favorite.controller'

const router = Router()

// GET /api/favorites - Obtener favoritos del usuario
router.get('/', verifyToken, getUserFavoritesController)

// GET /api/favorites/check/:workshopId - Verificar si es favorito
router.get('/check/:workshopId', verifyToken, checkFavoriteController)

// POST /api/favorites/:workshopId - Toggle favorito
router.post('/:workshopId', verifyToken, toggleFavoriteController)

export default router
