import { Router } from 'express'
import {
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import {
  createReviewController,
  getWorkshopReviewsController,
  updateReviewController,
  deleteReviewController,
} from '../controllers/review.controller'
import {
  CreateReviewSchema,
  UpdateReviewSchema,
} from './schemas/review.schemas'

const r = Router()

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear review
 *     description: Crea una nueva reseña para un taller
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshopId
 *               - rating
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review creada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
r.post('/reviews', verifyToken, requireUser, validateBody(CreateReviewSchema), createReviewController)

/**
 * @swagger
 * /api/workshops/{workshopId}/reviews:
 *   get:
 *     summary: Obtener reviews de un taller
 *     description: Lista todas las reseñas de un taller (público)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 averageRating:
 *                   type: number
 *                 totalReviews:
 *                   type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.get('/workshops/:workshopId/reviews', getWorkshopReviewsController)

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Actualizar review
 *     description: Actualiza una reseña (solo el propietario)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review actualizada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar review
 *     description: Elimina una reseña (solo el propietario)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review eliminada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.put('/reviews/:reviewId', verifyToken, requireUser, validateBody(UpdateReviewSchema), updateReviewController)
r.delete('/reviews/:reviewId', verifyToken, requireUser, deleteReviewController)

export default r
