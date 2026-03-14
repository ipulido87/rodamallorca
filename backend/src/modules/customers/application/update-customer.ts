// backend/src/modules/customers/application/update-customer.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import type {
  UpdateCustomerInput,
  Customer,
} from '../domain/entities/customer'
import { getEntityAndVerifyWorkshop } from '../../../lib/authorization'
import { validateUniqueEmail, validateUniqueTaxId } from '../../../lib/validators'

export interface UpdateCustomerDeps {
  customerRepository: CustomerRepository
  workshopId: string
}

export async function updateCustomer(
  customerId: string,
  data: UpdateCustomerInput,
  deps: UpdateCustomerDeps
): Promise<Customer> {
  const { customerRepository, workshopId } = deps

  // Verificar que el cliente existe y pertenece al taller usando helper compartido
  const existing = await customerRepository.findById(customerId)
  getEntityAndVerifyWorkshop(existing, 'Cliente', workshopId)

  // Validar email y taxId únicos usando validadores compartidos (excluyendo el ID actual)
  await validateUniqueEmail(data.email, workshopId, customerRepository, customerId)
  await validateUniqueTaxId(data.taxId, workshopId, customerRepository, customerId)

  const customer = await customerRepository.update(customerId, data)

  return customer
}
