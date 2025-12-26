// backend/src/modules/customers/application/delete-customer.ts
import type { CustomerRepository } from '../domain/repositories/customer-repository'

export interface DeleteCustomerDeps {
  customerRepository: CustomerRepository
  workshopId: string
}

export async function deleteCustomer(
  customerId: string,
  deps: DeleteCustomerDeps
): Promise<void> {
  const { customerRepository, workshopId } = deps

  // Verificar que el cliente existe y pertenece al taller
  const existing = await customerRepository.findById(customerId)
  if (!existing) {
    throw new Error('Cliente no encontrado')
  }
  if (existing.workshopId !== workshopId) {
    throw new Error('No tienes permiso para eliminar este cliente')
  }

  await customerRepository.delete(customerId)
}
