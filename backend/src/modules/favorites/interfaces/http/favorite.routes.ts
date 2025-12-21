import { Router } from 'express'
import { authenticate } from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  toggleFavoriteController,
  getUserFavoritesController,
  checkFavoriteController,
} from '../controllers/favorite.controller'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// GET /api/favorites - Obtener favoritos del usuario
router.get('/', getUserFavoritesController)

// GET /api/favorites/check/:workshopId - Verificar si es favorito
router.get('/check/:workshopId', checkFavoriteController)

// POST /api/favorites/:workshopId - Toggle favorito
router.post('/:workshopId', toggleFavoriteController)

export default router
