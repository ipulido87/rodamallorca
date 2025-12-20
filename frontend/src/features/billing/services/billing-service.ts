import { API } from '../../auth/services/auth-service'

// Enums
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus]

export const CustomerType = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
} as const

export type CustomerType = typeof CustomerType[keyof typeof CustomerType]

// Interfaces
export interface Customer {
  id: string
  workshopId: string
  type: CustomerType
  name: string
  taxId?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface InvoiceSeries {
  id: string
  workshopId: string
  name: string
  prefix: string
  nextNumber: number
  year: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  subtotal?: number
  taxAmount?: number
  total?: number
}

export interface Invoice {
  id: string
  workshopId: string
  customerId?: string | null
  seriesId: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string | null
  status: InvoiceStatus
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  notes?: string | null
  internalNotes?: string | null
  pdfUrl?: string | null
  paymentMethod?: string | null
  paidAt?: string | null
  createdAt: string
  updatedAt: string
  customer?: Customer
  series?: InvoiceSeries
  items?: InvoiceItem[]
}

export interface CreateCustomerData {
  workshopId: string
  type?: CustomerType
  name: string
  taxId?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
}

export interface CreateInvoiceData {
  workshopId: string
  customerId?: string
  seriesId: string
  issueDate?: string
  dueDate?: string
  status?: InvoiceStatus
  notes?: string
  internalNotes?: string
  paymentMethod?: string
  items: InvoiceItem[]
}

// API calls - Customers
export const createCustomer = async (data: CreateCustomerData): Promise<Customer> => {
  const response = await API.post('/owner/billing/customers', data)
  return response.data
}

export const getCustomersByWorkshop = async (workshopId: string): Promise<Customer[]> => {
  const response = await API.get(`/owner/billing/customers/workshop/${workshopId}`)
  return response.data
}

// API calls - Invoice Series
export const createInvoiceSeries = async (data: {
  workshopId: string
  name: string
  prefix: string
  year: number
  isDefault?: boolean
}): Promise<InvoiceSeries> => {
  const response = await API.post('/owner/billing/invoice-series', data)
  return response.data
}

export const getInvoiceSeriesByWorkshop = async (
  workshopId: string
): Promise<InvoiceSeries[]> => {
  const response = await API.get(`/owner/billing/invoice-series/workshop/${workshopId}`)
  return response.data
}

// API calls - Invoices
export const createInvoice = async (data: CreateInvoiceData): Promise<Invoice> => {
  const response = await API.post('/owner/billing/invoices', data)
  return response.data
}

export const getInvoicesByWorkshop = async (
  workshopId: string,
  filters?: { status?: InvoiceStatus; customerId?: string }
): Promise<Invoice[]> => {
  const response = await API.get(`/owner/billing/invoices/workshop/${workshopId}`, {
    params: filters,
  })
  return response.data
}

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await API.get(`/owner/billing/invoices/${id}`)
  return response.data
}

export const updateInvoice = async (
  id: string,
  data: Partial<Invoice>
): Promise<Invoice> => {
  const response = await API.patch(`/owner/billing/invoices/${id}`, data)
  return response.data
}

export const deleteInvoice = async (id: string): Promise<void> => {
  await API.delete(`/owner/billing/invoices/${id}`)
}

// Helpers
export const getInvoiceStatusLabel = (status: InvoiceStatus): string => {
  const labels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.DRAFT]: 'Borrador',
    [InvoiceStatus.SENT]: 'Enviada',
    [InvoiceStatus.PAID]: 'Pagada',
    [InvoiceStatus.OVERDUE]: 'Vencida',
    [InvoiceStatus.CANCELLED]: 'Cancelada',
  }
  return labels[status]
}

export const getInvoiceStatusColor = (
  status: InvoiceStatus
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors: Record<InvoiceStatus, any> = {
    [InvoiceStatus.DRAFT]: 'default',
    [InvoiceStatus.SENT]: 'info',
    [InvoiceStatus.PAID]: 'success',
    [InvoiceStatus.OVERDUE]: 'error',
    [InvoiceStatus.CANCELLED]: 'default',
  }
  return colors[status]
}

export const formatPrice = (priceInCents: number): string => {
  return `${(priceInCents / 100).toFixed(2)}€`
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES')
}
