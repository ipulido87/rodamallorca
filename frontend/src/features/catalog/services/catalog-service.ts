// frontend/src/features/catalog/services/catalog-service.ts
import { API } from '@/shared/api'
import type {
  PaginatedResponse,
  Product,
  ProductSearchParams,
  PublicProduct,
  Service,
  ServiceSearchParams,
  Workshop,
  WorkshopSearchParams,
} from '../types/catalog'

// Helper genérico type-safe
const buildQueryString = <T extends Record<string, unknown>>(
  params: T
): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

// Buscar productos públicamente
export const searchProducts = async (
  params?: ProductSearchParams
): Promise<PaginatedResponse<Product>> => {
  const queryString = params ? buildQueryString(params) : ''
  const url = `/catalog/products${queryString ? `?${queryString}` : ''}`

  const { data } = await API.get<PaginatedResponse<Product>>(url)
  return data
}

// Buscar workshops públicamente
export const searchWorkshops = async (
  params?: WorkshopSearchParams
): Promise<PaginatedResponse<Workshop>> => {
  const queryString = params ? buildQueryString(params) : ''
  const url = `/catalog/workshops${queryString ? `?${queryString}` : ''}`

  const { data } = await API.get<PaginatedResponse<Workshop>>(url)
  return data
}

// Buscar servicios públicamente
export const searchServices = async (
  params?: ServiceSearchParams
): Promise<PaginatedResponse<Service>> => {
  const queryString = params ? buildQueryString(params) : ''
  const url = `/catalog/services${queryString ? `?${queryString}` : ''}`

  const { data } = await API.get<PaginatedResponse<Service>>(url)
  return data
}

// Obtener detalle de producto
export const getProduct = async (id: string): Promise<PublicProduct> => {
  const { data } = await API.get<PublicProduct>(`/catalog/products/${id}`)
  return data
}

// Obtener detalle de workshop
export const getWorkshopById = async (id: string): Promise<Workshop> => {
  const { data } = await API.get<Workshop>(`/owner/workshops/${id}`)
  return data
}

// Búsqueda inteligente con IA
export interface AiSearchResponse {
  intent: 'workshops' | 'products' | 'services' | 'rentals' | 'routes'
  filters: {
    q?: string
    city?: string
    category?: string
    minPrice?: number
    maxPrice?: number
  }
  aiMessage?: string
  results: unknown[]
  total: number
}

export const aiSearch = async (query: string): Promise<AiSearchResponse> => {
  const { data } = await API.get<AiSearchResponse>(
    `/catalog/ai-search?q=${encodeURIComponent(query)}`
  )
  return data
}

// Alias para compatibilidad
export const getProductById = getProduct

// Exportar todo como objeto
export const catalogService = {
  searchProducts,
  searchWorkshops,
  searchServices,
  getProduct,
  getProductById,
  getWorkshopById,
} as const
