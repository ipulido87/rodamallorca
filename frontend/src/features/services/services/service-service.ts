import { API } from '../../auth/services/auth-service'

// Enums
export const VehicleType = {
  BICYCLE: 'BICYCLE',
  E_BIKE: 'E_BIKE',
  E_SCOOTER: 'E_SCOOTER',
  ALL: 'ALL',
} as const

export type VehicleType = typeof VehicleType[keyof typeof VehicleType]

export const ServiceStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

export type ServiceStatus = typeof ServiceStatus[keyof typeof ServiceStatus]

// Interfaces
export interface ServiceCategory {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  workshopId: string
  serviceCategoryId: string
  name: string
  description?: string | null
  price: number
  currency: string
  duration?: number | null
  vehicleType: VehicleType
  status: ServiceStatus
  createdAt: string
  updatedAt: string
  serviceCategory?: ServiceCategory
  workshop?: {
    id: string
    name: string
    city?: string | null
    country?: string | null
  }
}

export interface CreateServiceData {
  workshopId: string
  serviceCategoryId: string
  name: string
  description?: string
  price: number
  currency?: string
  duration?: number
  vehicleType?: VehicleType
  status?: ServiceStatus
}

export interface UpdateServiceData {
  name?: string
  description?: string
  price?: number
  currency?: string
  duration?: number
  vehicleType?: VehicleType
  status?: ServiceStatus
  serviceCategoryId?: string
}

export interface SearchServicesParams {
  workshopId?: string
  serviceCategoryId?: string
  vehicleType?: VehicleType
  status?: ServiceStatus
  city?: string
}

/**
 * Obtener todas las categorías de servicios
 */
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await API.get('/service-categories')
  return response.data
}

/**
 * Crear un nuevo servicio
 */
export const createService = async (
  data: CreateServiceData
): Promise<Service> => {
  const response = await API.post('/owner/services', data)
  return response.data
}

/**
 * Obtener servicios de un taller
 */
export const getWorkshopServices = async (
  workshopId: string
): Promise<Service[]> => {
  const response = await API.get(`/owner/services/workshop/${workshopId}`)
  return response.data
}

/**
 * Buscar servicios (catálogo público)
 */
export const searchServices = async (
  params: SearchServicesParams
): Promise<Service[]> => {
  const response = await API.get('/services', { params })
  return response.data
}

/**
 * Obtener un servicio por ID
 */
export const getServiceById = async (id: string): Promise<Service> => {
  const response = await API.get(`/services/${id}`)
  return response.data
}

/**
 * Actualizar un servicio
 */
export const updateService = async (
  id: string,
  data: UpdateServiceData
): Promise<Service> => {
  const response = await API.patch(`/owner/services/${id}`, data)
  return response.data
}

/**
 * Eliminar un servicio
 */
export const deleteService = async (id: string): Promise<void> => {
  await API.delete(`/owner/services/${id}`)
}

/**
 * Helper: Obtener etiqueta en español para tipo de vehículo
 */
export const getVehicleTypeLabel = (type: VehicleType): string => {
  const labels: Record<VehicleType, string> = {
    [VehicleType.BICYCLE]: 'Bicicleta',
    [VehicleType.E_BIKE]: 'Bicicleta Eléctrica',
    [VehicleType.E_SCOOTER]: 'Patinete Eléctrico',
    [VehicleType.ALL]: 'Todos los vehículos',
  }
  return labels[type]
}

/**
 * Helper: Formatear precio en euros
 */
export const formatPrice = (priceInCents: number): string => {
  return `${(priceInCents / 100).toFixed(2)}€`
}

/**
 * Helper: Formatear duración en formato legible
 */
export const formatDuration = (minutes?: number | null): string => {
  if (!minutes) return 'Duración no especificada'

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}min`
}
