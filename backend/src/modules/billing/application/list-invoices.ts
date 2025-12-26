import type { BillingRepository } from '../domain/repositories/billing-repository'
import type { Invoice, Customer } from '../domain/entities/billing'

interface ListInvoicesDeps {
  repo: BillingRepository
}

export async function listInvoicesByWorkshop(
  workshopId: string,
  filters: { status?: string; customerId?: string },
  deps: ListInvoicesDeps
): Promise<Invoice[]> {
  const { repo } = deps
  const invoices = await repo.findInvoicesByWorkshop(workshopId, filters)
  return invoices
}

export async function listCustomersByWorkshop(
  workshopId: string,
  deps: ListInvoicesDeps
): Promise<Customer[]> {
  const { repo } = deps
  const customers = await repo.findCustomersByWorkshop(workshopId)
  return customers
}
