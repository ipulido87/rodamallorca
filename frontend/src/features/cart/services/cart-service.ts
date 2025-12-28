import { API } from '../../auth/services/auth-service'

interface CreateOrderItem {
  productId: string | null
  quantity: number
  priceAtOrder: number
  currency: string
  description: string | null
}

interface CreateOrderPayload {
  workshopId: string
  notes?: string
  items: CreateOrderItem[]
}

export interface CreateOrderResponse {
  id: string
  userId: string
  workshopId: string
  status: string
  totalAmount: number
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    orderId: string
    productId: string | null
    quantity: number
    priceAtOrder: number
    currency: string
    description: string | null
  }>
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  const response = await API.post<CreateOrderResponse>('/orders', payload)
  return response.data
}
