import { Router } from 'express'
import {
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import {
  createReviewController,
  getWorkshopReviewsController,
  updateReviewController,
  deleteReviewController,
} from '../controllers/review.controller'

const r = Router()

// Crear una review (requiere autenticación)
r.post('/reviews', verifyToken, requireUser, createReviewController)

// Obtener reviews de un taller (público)
r.get('/workshops/:workshopId/reviews', getWorkshopReviewsController)

// Actualizar review (requiere ser el propietario)
r.put('/reviews/:reviewId', verifyToken, requireUser, updateReviewController)

// Eliminar review (requiere ser el propietario)
r.delete('/reviews/:reviewId', verifyToken, requireUser, deleteReviewController)

export default r
