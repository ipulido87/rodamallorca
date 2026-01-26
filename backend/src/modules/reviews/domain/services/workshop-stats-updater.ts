import prisma from '@/lib/prisma'
import type { ReviewRepository } from '../repositories/review-repository'

/**
 * Servicio de dominio para actualizar estadísticas de reviews del workshop
 * Centraliza la lógica que antes estaba duplicada en create/update/delete review
 */
export class WorkshopStatsUpdater {
  /**
   * Actualiza el promedio de rating y el conteo de reviews de un taller
   * @param workshopId - ID del taller a actualizar
   * @param repo - Repositorio de reviews para obtener las estadísticas
   */
  static async updateStats(
    workshopId: string,
    repo: ReviewRepository
  ): Promise<void> {
    const averageRating = await repo.getWorkshopAverageRating(workshopId)
    const reviewCount = await repo.getWorkshopReviewCount(workshopId)

    await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        averageRating: averageRating || 0,
        reviewCount,
      },
    })
  }
}
