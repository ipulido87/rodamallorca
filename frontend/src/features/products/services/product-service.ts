import { API } from '@/shared/api'
import type { ProcessedImage } from '../../media/services/media-service'

export interface CreateProductData {
  title: string
  price: number
  condition?: 'new' | 'used' | 'refurb'
  status?: 'DRAFT' | 'PUBLISHED' | 'SOLD'
  description?: string
  categoryId?: string,
  images: ProcessedImage[]
}

export interface Product {
  images: any
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
  updatedAt: string
  // Campos de alquiler
  isRental?: boolean
  rentalPricePerDay?: number
  rentalPricePerWeek?: number
  availableQuantity?: number
  bikeType?: string
  bikeSize?: string
  bikeBrand?: string
  bikeModel?: string
  frameSize?: number
  includesHelmet?: boolean
  includesLock?: boolean
  includesLights?: boolean
  depositAmount?: number
  minRentalDays?: number
  maxRentalDays?: number
}

export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  const response = await API.post('/owner/products', data)
  return response.data
}

export const getMyProducts = async (): Promise<Product[]> => {
  const response = await API.get('/owner/products/mine')
  return response.data
}

export const publishProduct = async (id: string): Promise<void> => {
  await API.post(`/owner/products/${id}/publish`)
}
