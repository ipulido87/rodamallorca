// backend/src/modules/customers/domain/entities/customer.ts

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
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerInput {
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
