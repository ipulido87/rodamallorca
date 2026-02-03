import { API as api } from '@/shared/api'

/**
 * Servicio para gestionar alquiler de bicicletas
 */

export interface RentalBike {
  id: string
  title: string
  description?: string
  rentalPricePerDay: number
  rentalPricePerWeek?: number
  availableQuantity: number
  bikeType?: string
  bikeSize?: string
  bikeBrand?: string
  bikeModel?: string
  frameSize?: number
  includesHelmet: boolean
  includesLock: boolean
  includesLights: boolean
  depositAmount?: number
  minRentalDays: number
  maxRentalDays: number
  images: Array<{
    id: string
    original: string
    medium: string
    thumbnail: string
  }>
  workshop: {
    id: string
    name: string
    city?: string
    address?: string
    phone?: string
    latitude?: number
    longitude?: number
    isVerified: boolean
  }
  category?: {
    id: string
    name: string
  }
}

export interface RentalFilters {
  city?: string
  bikeType?: string
  minPrice?: number
  maxPrice?: number
  bikeSize?: string
  startDate?: string
  endDate?: string
  includesHelmet?: boolean
  includesLock?: boolean
}

export interface AvailabilityResponse {
  success: boolean
  available: boolean
  availableQuantity: number
  conflictingReservations?: number
}

export interface PriceCalculation {
  success: boolean
  days: number
  pricePerDay: number
  pricePerWeek?: number
  totalPrice: number
  deposit?: number
  breakdown: string
}

export interface BlockedDate {
  startDate: string
  endDate: string
  quantityBlocked: number
}

/**
 * Lista todas las bicicletas de alquiler con filtros
 */
export async function getRentalBikes(filters?: RentalFilters): Promise<{
  success: boolean
  bikes: RentalBike[]
  total: number
}> {
  const params = new URLSearchParams()

  if (filters?.city) params.append('city', filters.city)
  if (filters?.bikeType) params.append('bikeType', filters.bikeType)
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
  if (filters?.bikeSize) params.append('bikeSize', filters.bikeSize)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.includesHelmet) params.append('includesHelmet', 'true')
  if (filters?.includesLock) params.append('includesLock', 'true')

  const response = await api.get(`/rentals/bikes${params.toString() ? '?' + params.toString() : ''}`)
  return response.data
}

/**
 * Obtiene detalles de una bicicleta
 */
export async function getRentalBikeDetails(bikeId: string): Promise<{
  success: boolean
  bike: RentalBike
}> {
  const response = await api.get(`/rentals/bikes/${bikeId}`)
  return response.data
}

/**
 * Verifica disponibilidad en fechas específicas
 */
export async function checkAvailability(
  bikeId: string,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<AvailabilityResponse> {
  const response = await api.post(`/rentals/bikes/${bikeId}/check-availability`, {
    startDate,
    endDate,
    quantity,
  })
  return response.data
}

/**
 * Calcula precio para unas fechas
 */
export async function calculatePrice(
  bikeId: string,
  startDate: string,
  endDate: string
): Promise<PriceCalculation> {
  const response = await api.post(`/rentals/bikes/${bikeId}/calculate-price`, {
    startDate,
    endDate,
  })
  return response.data
}

/**
 * Obtiene fechas bloqueadas
 */
export async function getBlockedDates(bikeId: string): Promise<{
  success: boolean
  blockedDates: BlockedDate[]
}> {
  const response = await api.get(`/rentals/bikes/${bikeId}/blocked-dates`)
  return response.data
}

/**
 * Obtiene opciones para filtros
 */
export async function getRentalFiltersOptions(): Promise<{
  success: boolean
  filters: {
    cities: Array<{ city: string; count: number }>
    bikeTypes: Array<{ type: string; count: number }>
    priceRange: { min: number; max: number }
  }
}> {
  const response = await api.get('/rentals/filters')
  return response.data
}
