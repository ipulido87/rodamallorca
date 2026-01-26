// backend/src/modules/customers/application/delete-customer.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import { getEntityAndVerifyWorkshop } from '@/lib/authorization'

export interface DeleteCustomerDeps {
  customerRepository: CustomerRepository
  workshopId: string
}

export async function deleteCustomer(
  customerId: string,
  deps: DeleteCustomerDeps
): Promise<void> {
  const { customerRepository, workshopId } = deps

  // Verificar que el cliente existe y pertenece al taller usando helper compartido
  const existing = await customerRepository.findById(customerId)
  getEntityAndVerifyWorkshop(existing, 'Cliente', workshopId)

  await customerRepository.delete(customerId)
}
