import type { ReviewRepository } from '../repositories/review-repository'

/**
 * Interfaz mínima del repositorio de Workshop necesaria para actualizar stats
 */
export interface WorkshopStatsRepository {
  updateStats(workshopId: string, stats: { averageRating: number; reviewCount: number }): Promise<void>
}

/**
 * Servicio de dominio para actualizar estadísticas de reviews del workshop
 * Centraliza la lógica que antes estaba duplicada en create/update/delete review
 */
export class WorkshopStatsUpdater {
  /**
   * Actualiza el promedio de rating y el conteo de reviews de un taller
   * @param workshopId - ID del taller a actualizar
   * @param reviewRepo - Repositorio de reviews para obtener las estadísticas
   * @param workshopRepo - Repositorio de workshop para actualizar las estadísticas
   */
  static async updateStats(
    workshopId: string,
    reviewRepo: ReviewRepository,
    workshopRepo: WorkshopStatsRepository
  ): Promise<void> {
    const averageRating = await reviewRepo.getWorkshopAverageRating(workshopId)
    const reviewCount = await reviewRepo.getWorkshopReviewCount(workshopId)

    await workshopRepo.updateStats(workshopId, {
      averageRating: averageRating || 0,
      reviewCount,
    })
  }
}
