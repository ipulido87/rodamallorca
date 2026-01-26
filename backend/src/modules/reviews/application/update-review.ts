import type { ReviewRepository } from '../domain/repositories/review-repository'
import { verifyEntityExists } from '@/lib/authorization'
import { validateRating } from '@/lib/validators'
import { WorkshopStatsUpdater, type WorkshopStatsRepository } from '../domain/services/workshop-stats-updater'
import { ERRORS } from '@/lib/errors/error-messages'

export async function updateReview(
  reviewId: string,
  input: {
    rating?: number
    comment?: string | null
  },
  deps: {
    repo: ReviewRepository
    workshopRepo: WorkshopStatsRepository
    authenticatedUserId: string
  }
) {
  // Verificar que la review existe usando helper compartido
  const review = await deps.repo.findById(reviewId)
  verifyEntityExists(review, 'Review')

  // Verificar que el usuario es el propietario
  if (review.userId !== deps.authenticatedUserId) {
    throw new Error(ERRORS.NO_PERMISSION('editar esta review'))
  }

  // Validar rating si se proporciona, usando validador compartido
  if (input.rating !== undefined) {
    validateRating(input.rating)
  }

  // Actualizar la review
  const updatedReview = await deps.repo.update(reviewId, input)

  if (!updatedReview) {
    throw new Error('Error al actualizar la review')
  }

  // Actualizar estadísticas del workshop usando servicio centralizado
  await WorkshopStatsUpdater.updateStats(review.workshopId, deps.repo, deps.workshopRepo)

  return updatedReview
}
