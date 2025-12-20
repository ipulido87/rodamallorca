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

// Customer
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
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerInput {
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

export interface UpdateCustomerInput {
  name?: string
  taxId?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
  type?: CustomerType
}

// Invoice Series
export interface InvoiceSeries {
  id: string
  workshopId: string
  name: string
  prefix: string
  nextNumber: number
  year: number
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateInvoiceSeriesInput {
  workshopId: string
  name: string
  prefix: string
  year: number
  isDefault?: boolean
}

// Invoice
export interface Invoice {
  id: string
  workshopId: string
  customerId?: string | null
  seriesId: string
  invoiceNumber: string
  issueDate: Date
  dueDate?: Date | null
  status: InvoiceStatus
  subtotal: number
  taxAmount: number
  total: number
  currency: string
  notes?: string | null
  internalNotes?: string | null
  pdfUrl?: string | null
  paymentMethod?: string | null
  paidAt?: Date | null
  createdAt: Date
  updatedAt: Date
  customer?: Customer
  items?: InvoiceItem[]
  series?: InvoiceSeries
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateInvoiceItemInput {
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
}

export interface CreateInvoiceInput {
  workshopId: string
  customerId?: string
  seriesId: string
  issueDate?: Date
  dueDate?: Date
  status?: InvoiceStatus
  notes?: string
  internalNotes?: string
  paymentMethod?: string
  items: CreateInvoiceItemInput[]
}

export interface UpdateInvoiceInput {
  customerId?: string
  dueDate?: Date
  status?: InvoiceStatus
  notes?: string
  internalNotes?: string
  paymentMethod?: string
  paidAt?: Date
}
