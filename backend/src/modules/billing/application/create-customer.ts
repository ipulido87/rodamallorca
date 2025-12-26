import type { BillingRepository } from '../domain/repositories/billing-repository'
import type { Customer, CreateCustomerInput } from '../domain/entities/billing'

interface CreateCustomerDeps {
  repo: BillingRepository
  authenticatedUserId: string
}

interface WorkshopRepository {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>
}

export async function createCustomer(
  data: CreateCustomerInput,
  deps: CreateCustomerDeps & { workshopRepo: WorkshopRepository }
): Promise<Customer> {
  const { repo, workshopRepo, authenticatedUserId } = deps

  // Verificar que el taller existe y que el usuario es el dueño
  const workshop = await workshopRepo.findById(data.workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (workshop.ownerId !== authenticatedUserId) {
    throw new Error('No tienes permisos para crear clientes en este taller')
  }

  const customer = await repo.createCustomer(data)
  return customer
}
