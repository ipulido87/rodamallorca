import { Router } from 'express'
import { verifyToken } from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  toggleFavoriteController,
  getUserFavoritesController,
  checkFavoriteController,
} from '../controllers/favorite.controller'

const router = Router()

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Obtener favoritos del usuario
 *     description: Lista todos los talleres marcados como favoritos por el usuario
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de talleres favoritos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workshop'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', verifyToken, getUserFavoritesController)

/**
 * @swagger
 * /api/favorites/check/{workshopId}:
 *   get:
 *     summary: Verificar si es favorito
 *     description: Comprueba si un taller está en los favoritos del usuario
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado del favorito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFavorite:
 *                   type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/check/:workshopId', verifyToken, checkFavoriteController)

/**
 * @swagger
 * /api/favorites/{workshopId}:
 *   post:
 *     summary: Toggle favorito
 *     description: Añade o quita un taller de los favoritos del usuario
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFavorite:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:workshopId', verifyToken, toggleFavoriteController)

export default router
