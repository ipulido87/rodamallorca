import type {
  RentalBike,
  RentalFilters,
  RentalFilterOptions,
} from '../entities/rental-bike'

/**
 * Interfaz del repositorio de alquileres
 *
 * Define el contrato para acceder a datos de bicicletas de alquiler.
 * La implementacion concreta (Prisma) estara en infraestructura.
 */
export interface RentalRepository {
  /**
   * Busca bicicletas de alquiler con filtros opcionales
   */
  findRentalBikes(filters: RentalFilters): Promise<RentalBike[]>

  /**
   * Obtiene los detalles de una bicicleta de alquiler por ID
   */
  findRentalBikeById(id: string): Promise<RentalBike | null>

  /**
   * Obtiene las opciones de filtros disponibles (ciudades, tipos, precios)
   */
  getFilterOptions(): Promise<RentalFilterOptions>

  /**
   * Obtiene los pedidos de alquiler activos de un producto en un rango de fechas
   * para calcular disponibilidad
   */
  getActiveRentalOrdersInRange(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ quantity: number }>>
}
