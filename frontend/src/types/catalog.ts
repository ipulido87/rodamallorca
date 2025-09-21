// types/catalog.ts

export interface Workshop {
  id: string
  ownerId: string
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
}

export interface ProductImage {
  id: string
  url: string
  productId: string
}

export interface Product {
  id: string
  title: string
  description?: string
  price: number
  status: 'PUBLISHED' | 'DRAFT'
  categoryId: string | null
  workshopId: string
  createdAt: string
  updatedAt: string
  workshop: {
    id: string
    name: string
    city?: string
    country?: string
  }
  category: {
    id: string
    name: string
  } | null
  images: ProductImage[]
}

export interface ProductSearchParams {
  q?: string
  categoryId?: string
  city?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
}

export interface WorkshopSearchParams {
  q?: string
  city?: string
  page?: number
  size?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

// Tipos para filtros
export type FilterValue = string | number | [number, number] | undefined

export interface FilterValues {
  [key: string]: FilterValue
}

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'range' | 'text'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
}
