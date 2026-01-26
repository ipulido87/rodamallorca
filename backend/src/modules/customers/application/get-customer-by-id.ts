// backend/src/modules/customers/application/get-customer-by-id.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import type { Customer } from '../domain/entities/customer'
import { verifyResourceBelongsToWorkshop } from '../../../lib/authorization'

export interface GetCustomerByIdDeps {
  customerRepository: CustomerRepository
  workshopId: string
}

export async function getCustomerById(
  customerId: string,
  deps: GetCustomerByIdDeps
): Promise<Customer | null> {
  const { customerRepository, workshopId } = deps

  const customer = await customerRepository.findById(customerId)

  // Verificar que el cliente pertenece al taller usando helper compartido
  if (customer) {
    try {
      verifyResourceBelongsToWorkshop(customer.workshopId, workshopId, 'cliente')
    } catch {
      return null
    }
  }

  return customer
}
