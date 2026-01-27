import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceSeries,
  CreateInvoiceSeriesInput,
} from '../entities/billing'

export interface BillingRepository {
  // Customers
  createCustomer(data: CreateCustomerInput): Promise<Customer>
  findCustomerById(id: string): Promise<Customer | null>
  findCustomersByWorkshop(workshopId: string): Promise<Customer[]>
  updateCustomer(id: string, data: UpdateCustomerInput): Promise<Customer>
  deleteCustomer(id: string): Promise<void>

  // Invoice Series
  createInvoiceSeries(data: CreateInvoiceSeriesInput): Promise<InvoiceSeries>
  findInvoiceSeriesByWorkshop(workshopId: string): Promise<InvoiceSeries[]>
  findDefaultSeriesByWorkshop(workshopId: string): Promise<InvoiceSeries | null>
  getNextInvoiceNumber(seriesId: string): Promise<string>

  // Invoices
  createInvoice(data: CreateInvoiceInput): Promise<Invoice>
  findInvoiceById(id: string): Promise<Invoice | null>
  findInvoiceByIdWithDetails(id: string): Promise<any | null>
  findInvoicesByWorkshop(workshopId: string, filters?: {
    status?: string
    customerId?: string
  }): Promise<Invoice[]>
  updateInvoice(id: string, data: UpdateInvoiceInput): Promise<Invoice>
  deleteInvoice(id: string): Promise<void>
}
