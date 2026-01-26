import type { BillingRepository } from '../domain/repositories/billing-repository'
import type { Customer, CreateCustomerInput } from '../domain/entities/billing'
import { verifyWorkshopOwnership } from '@/lib/authorization'

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

  // Verificar que el taller existe y que el usuario es el dueño usando helper compartido
  await verifyWorkshopOwnership(data.workshopId, authenticatedUserId, workshopRepo)

  const customer = await repo.createCustomer(data)
  return customer
}
