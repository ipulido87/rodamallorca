import { Router } from 'express'
import { verifyToken } from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  toggleFavoriteController,
  getUserFavoritesController,
  checkFavoriteController,
} from '../controllers/favorite.controller'

const router = Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// GET /api/favorites - Obtener favoritos del usuario
router.get('/', getUserFavoritesController)

// GET /api/favorites/check/:workshopId - Verificar si es favorito
router.get('/check/:workshopId', checkFavoriteController)

// POST /api/favorites/:workshopId - Toggle favorito
router.post('/:workshopId', toggleFavoriteController)

export default router
