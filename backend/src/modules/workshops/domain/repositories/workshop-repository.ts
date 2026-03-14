export interface WorkshopDTO {
  id: string
  ownerId: string
  name: string
  description?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  phone?: string | null
  logoOriginal?: string | null
  logoMedium?: string | null
  logoThumbnail?: string | null
  stripeConnectedAccountId?: string | null
  stripeOnboardingComplete?: boolean
}

export interface WorkshopRepository {
  create(input: Omit<WorkshopDTO, 'id'>): Promise<WorkshopDTO>
  findById(id: string): Promise<WorkshopDTO | null>
  // ↓ AGREGAR ESTOS MÉTODOS
  findByOwnerId(ownerId: string): Promise<WorkshopDTO[]>
  update(id: string, input: Partial<Omit<WorkshopDTO, 'id' | 'ownerId'>>): Promise<WorkshopDTO | null>
  delete(id: string): Promise<boolean>
  findAll(): Promise<WorkshopDTO[]>
  // Método para actualizar estadísticas de reviews
  updateStats(workshopId: string, stats: { averageRating: number; reviewCount: number }): Promise<void>
  // Métodos para Stripe Connect
  updateStripeAccount(workshopId: string, accountId: string | null, onboardingComplete: boolean): Promise<void>
  findByIdWithStripe(id: string): Promise<WorkshopDTO | null>
}