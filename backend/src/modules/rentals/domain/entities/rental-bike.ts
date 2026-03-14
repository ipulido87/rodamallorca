/**
 * Entidad que representa una bicicleta de alquiler
 */
export interface RentalBike {
  id: string
  workshopId: string
  title: string
  description?: string | null
  bikeType?: string | null
  bikeSize?: string | null
  includesHelmet: boolean
  includesLock: boolean
  rentalPricePerDay: number
  depositAmount?: number | null
  minRentalDays?: number | null
  maxRentalDays?: number | null
  availableQuantity: number
  status: string
  images: RentalBikeImage[]
  workshop: RentalWorkshopInfo
  category?: RentalCategory | null
}

export interface RentalBikeImage {
  id: string
  original: string
  medium: string
  thumbnail: string
  position: number
}

export interface RentalWorkshopInfo {
  id: string
  name: string
  city?: string | null
  address?: string | null
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  isVerified: boolean
  averageRating?: number | null
  reviewCount?: number | null
}

export interface RentalCategory {
  id: string
  name: string
}

/**
 * Resultado de verificar disponibilidad
 */
export interface AvailabilityResult {
  available: boolean
  availableQuantity: number
  totalQuantity: number
  requestedQuantity: number
}

/**
 * Resultado del calculo de precio
 */
export interface PriceCalculation {
  days: number
  pricePerDay: number
  subtotal: number
  deposit: number
  total: number
}

/**
 * Fechas bloqueadas para un producto
 */
export interface BlockedDateRange {
  startDate: Date
  endDate: Date
}

/**
 * Filtros para buscar bicis de alquiler
 */
export interface RentalFilters {
  city?: string
  bikeType?: string
  minPrice?: number
  maxPrice?: number
  bikeSize?: string
  startDate?: Date
  endDate?: Date
  includesHelmet?: boolean
  includesLock?: boolean
}

/**
 * Opciones de filtros disponibles
 */
export interface RentalFilterOptions {
  cities: Array<{ city: string | null; count: number }>
  bikeTypes: Array<{ type: string | null; count: number }>
  priceRange: {
    min: number
    max: number
  }
}
