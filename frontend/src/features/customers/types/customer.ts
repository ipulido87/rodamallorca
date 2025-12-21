// frontend/src/features/customers/types/customer.ts

export type CustomerType = 'INDIVIDUAL' | 'BUSINESS'

export interface Customer {
  id: string
  workshopId: string
  type: CustomerType
  name: string
  taxId?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
  createdAt: string
  updatedAt: string
  _count?: {
    invoices: number
  }
}

export interface CreateCustomerInput {
  type: CustomerType
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
  type?: CustomerType
  name?: string
  taxId?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  notes?: string
}
