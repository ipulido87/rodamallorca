import type {
  CreateServiceInput,
  Service,
  ServiceCategory,
  UpdateServiceInput,
  VehicleType,
  ServiceStatus,
} from '../entities/service'

export interface ServiceRepository {
  /**
   * Crear un nuevo servicio
   */
  create(data: CreateServiceInput): Promise<Service>

  /**
   * Obtener un servicio por ID
   */
  findById(id: string): Promise<Service | null>

  /**
   * Listar servicios de un taller
   */
  findByWorkshopId(workshopId: string): Promise<Service[]>

  /**
   * Listar servicios por categoría
   */
  findByCategory(categoryId: string): Promise<Service[]>

  /**
   * Listar servicios por tipo de vehículo
   */
  findByVehicleType(vehicleType: VehicleType): Promise<Service[]>

  /**
   * Buscar servicios (catálogo público)
   */
  search(filters: {
    workshopId?: string
    serviceCategoryId?: string
    vehicleType?: VehicleType
    status?: ServiceStatus
    city?: string
  }): Promise<Service[]>

  /**
   * Actualizar un servicio
   */
  update(id: string, data: UpdateServiceInput): Promise<Service>

  /**
   * Eliminar un servicio
   */
  delete(id: string): Promise<void>

  /**
   * Listar todas las categorías de servicios
   */
  findAllCategories(): Promise<ServiceCategory[]>

  /**
   * Obtener una categoría por ID
   */
  findCategoryById(id: string): Promise<ServiceCategory | null>
}
