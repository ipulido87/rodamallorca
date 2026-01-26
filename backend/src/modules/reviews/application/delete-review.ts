import type { ReviewRepository } from '../domain/repositories/review-repository'
import { verifyEntityExists } from '@/lib/authorization'
import { WorkshopStatsUpdater } from '../domain/services/workshop-stats-updater'
import { ERRORS } from '@/lib/errors/error-messages'

export async function deleteReview(
  reviewId: string,
  deps: { repo: ReviewRepository; authenticatedUserId: string }
) {
  // Verificar que la review existe usando helper compartido
  const review = await deps.repo.findById(reviewId)
  verifyEntityExists(review, 'Review')

  // Verificar que el usuario es el propietario
  if (review.userId !== deps.authenticatedUserId) {
    throw new Error(ERRORS.NO_PERMISSION('eliminar esta review'))
  }

  const workshopId = review.workshopId

  // Eliminar la review
  const deleted = await deps.repo.delete(reviewId)

  if (!deleted) {
    throw new Error('Error al eliminar la review')
  }

  // Actualizar estadísticas del workshop usando servicio centralizado
  await WorkshopStatsUpdater.updateStats(workshopId, deps.repo)

  return true
}
