// backend/src/modules/customers/domain/repositories/customer-repository.ts
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from '../entities/customer'

export interface CustomerRepository {
  create(data: CreateCustomerInput): Promise<Customer>
  findById(id: string): Promise<Customer | null>
  findByWorkshop(workshopId: string): Promise<Customer[]>
  findByEmail(workshopId: string, email: string): Promise<Customer | null>
  findByTaxId(workshopId: string, taxId: string): Promise<Customer | null>
  update(id: string, data: UpdateCustomerInput): Promise<Customer>
  delete(id: string): Promise<void>
}
