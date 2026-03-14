// backend/src/modules/customers/application/create-customer.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import type {
  CreateCustomerInput,
  Customer,
} from '../domain/entities/customer'
import { validateUniqueEmail, validateUniqueTaxId } from '../../../lib/validators'

export interface CreateCustomerDeps {
  customerRepository: CustomerRepository
}

export async function createCustomer(
  data: CreateCustomerInput,
  deps: CreateCustomerDeps
): Promise<Customer> {
  const { customerRepository } = deps

  // Validar email y taxId únicos usando validadores compartidos
  await validateUniqueEmail(data.email, data.workshopId, customerRepository)
  await validateUniqueTaxId(data.taxId, data.workshopId, customerRepository)

  const customer = await customerRepository.create(data)

  return customer
}
