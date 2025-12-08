import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

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
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await axios.post<CreateOrderResponse>(
    `${API_URL}/orders`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.data
}
