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

export interface ServiceCategory {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  workshopId: string
  serviceCategoryId: string
  name: string
  description?: string | null
  price: number // en céntimos
  currency: string
  duration?: number | null // en minutos
  vehicleType: VehicleType
  status: ServiceStatus
  createdAt: Date
  updatedAt: Date

  // Relaciones opcionales
  serviceCategory?: ServiceCategory
}

export interface CreateServiceInput {
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

export interface UpdateServiceInput {
  name?: string
  description?: string
  price?: number
  currency?: string
  duration?: number
  vehicleType?: VehicleType
  status?: ServiceStatus
  serviceCategoryId?: string
}
