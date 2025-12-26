// backend/src/modules/customers/application/update-customer.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'
import type {
  UpdateCustomerInput,
  Customer,
} from '../domain/entities/customer'

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

  // Verificar que el cliente existe y pertenece al taller
  const existing = await customerRepository.findById(customerId)
  if (!existing) {
    throw new Error('Cliente no encontrado')
  }
  if (existing.workshopId !== workshopId) {
    throw new Error('No tienes permiso para modificar este cliente')
  }

  // Verificar duplicados si se actualiza email o taxId
  if (data.email && data.email !== existing.email) {
    const existingByEmail = await customerRepository.findByEmail(
      workshopId,
      data.email
    )
    if (existingByEmail && existingByEmail.id !== customerId) {
      throw new Error('Ya existe un cliente con ese email')
    }
  }

  if (data.taxId && data.taxId !== existing.taxId) {
    const existingByTaxId = await customerRepository.findByTaxId(
      workshopId,
      data.taxId
    )
    if (existingByTaxId && existingByTaxId.id !== customerId) {
      throw new Error('Ya existe un cliente con ese NIF/CIF')
    }
  }

  const customer = await customerRepository.update(customerId, data)

  return customer
}
