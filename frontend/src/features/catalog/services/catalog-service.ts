import { API } from '../../../features/auth/services/auth-service'
import type {
  PaginatedResponse,
  Product,
  ProductSearchParams,
  PublicProduct,
  Workshop,
  WorkshopSearchParams,
} from '../../catalog/types/catalog'

// Buscar talleres públicamente
export async function searchWorkshops(
  params?: WorkshopSearchParams
): Promise<PaginatedResponse<Workshop>> {
  const searchParams = new URLSearchParams()

  if (params?.q) searchParams.append('q', params.q)
  if (params?.city) searchParams.append('city', params.city)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.size) searchParams.append('size', params.size.toString())

  const queryString = searchParams.toString()
  const url = queryString
    ? `/catalog/workshops?${queryString}`
    : '/catalog/workshops'

  const res = await API.get(url)
  return res.data
}

// Buscar productos públicamente
export async function searchProducts(
  params?: ProductSearchParams
): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams()

  if (params?.q) searchParams.append('q', params.q)
  if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
  if (params?.city) searchParams.append('city', params.city)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.size) searchParams.append('size', params.size.toString())

  const queryString = searchParams.toString()
  const url = queryString
    ? `/catalog/products?${queryString}`
    : '/catalog/products'

  const res = await API.get(url)
  return res.data
}

// Obtener detalle de producto (ambos nombres para compatibilidad)
export async function getProduct(id: string): Promise<PublicProduct> {
  const res = await API.get(`/catalog/products/${id}`)
  return res.data
}

export async function getWorkshopById(id: string): Promise<Workshop> {
  const res = await API.get(`/owner/workshops/${id}`)
  return res.data
}

// Alias para compatibilidad con código existente
export const getProductById = getProduct
