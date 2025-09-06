export interface WorkshopDTO {
  id: string
  ownerId: string
  name: string
  description?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  phone?: string | null
}

export interface WorkshopRepository {
  create(input: Omit<WorkshopDTO, 'id'>): Promise<WorkshopDTO>
  findById(id: string): Promise<WorkshopDTO | null>
}
