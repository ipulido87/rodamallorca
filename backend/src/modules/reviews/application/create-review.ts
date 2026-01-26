import type { ReviewRepository } from '../domain/repositories/review-repository'
import { validateRating } from '@/lib/validators'
import { WorkshopStatsUpdater } from '../domain/services/workshop-stats-updater'

export async function createReview(
  input: {
    workshopId: string
    userId: string
    rating: number
    comment?: string | null
  },
  deps: { repo: ReviewRepository }
) {
  // Validar rating usando validador compartido
  validateRating(input.rating)

  // Verificar si el usuario ya dejó una review para este taller
  const existingReview = await deps.repo.findByWorkshopAndUser(
    input.workshopId,
    input.userId
  )

  if (existingReview) {
    throw new Error('Ya has dejado una review para este taller')
  }

  // Crear la review
  const review = await deps.repo.create(input)

  // Actualizar estadísticas del workshop usando servicio centralizado
  await WorkshopStatsUpdater.updateStats(input.workshopId, deps.repo)

  return review
}
