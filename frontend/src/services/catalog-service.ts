import { API } from './auth-service'

export interface SearchParams {
  q?: string
  categoryId?: string
  city?: string
  page?: number
  size?: number
  min?: number
  max?: number
}

export interface CatalogResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  position: number
}

export interface PublicProduct {
  id: string
  workshopId: string
  title: string
  price: number
  currency: string
  condition: string
  status: string
  description?: string
  categoryId?: string
  createdAt: string
  workshop: {
    id: string
    name: string
    city: string
    country: string
  }
  category?: {
    id: string
    name: string
  }
  images: ProductImage[]
}

export interface PublicWorkshop {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  createdAt: string
}

export const searchProducts = async (
  params: SearchParams = {}
): Promise<CatalogResponse<PublicProduct>> => {
  const response = await API.get('/catalog/products', { params })
  return response.data
}

export const searchWorkshops = async (
  params: SearchParams = {}
): Promise<CatalogResponse<PublicWorkshop>> => {
  const response = await API.get('/catalog/workshops', { params })
  return response.data
}

export const getProductById = async (id: string): Promise<PublicProduct> => {
  const response = await API.get(`/catalog/products/${id}`)
  return response.data
}
