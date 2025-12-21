// backend/src/modules/customers/application/create-customer.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import type {
  CreateCustomerInput,
  Customer,
} from '../domain/entities/customer'

export interface CreateCustomerDeps {
  customerRepository: CustomerRepository
}

export async function createCustomer(
  data: CreateCustomerInput,
  deps: CreateCustomerDeps
): Promise<Customer> {
  const { customerRepository } = deps

  // Verificar si ya existe un cliente con el mismo email o taxId
  if (data.email) {
    const existingByEmail = await customerRepository.findByEmail(
      data.workshopId,
      data.email
    )
    if (existingByEmail) {
      throw new Error('Ya existe un cliente con ese email')
    }
  }

  if (data.taxId) {
    const existingByTaxId = await customerRepository.findByTaxId(
      data.workshopId,
      data.taxId
    )
    if (existingByTaxId) {
      throw new Error('Ya existe un cliente con ese NIF/CIF')
    }
  }

  const customer = await customerRepository.create(data)

  return customer
}
