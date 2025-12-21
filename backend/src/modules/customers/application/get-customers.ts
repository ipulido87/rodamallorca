// backend/src/modules/customers/application/get-customers.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import type { Customer } from '../domain/entities/customer'

export interface GetCustomersDeps {
  customerRepository: CustomerRepository
  workshopId: string
}

export async function getCustomers(
  deps: GetCustomersDeps
): Promise<Customer[]> {
  const { customerRepository, workshopId } = deps

  const customers = await customerRepository.findByWorkshop(workshopId)

  return customers
}
