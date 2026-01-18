import { OrderStatus } from '../enums/order-status'

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  quantity: number
  priceAtOrder: number
  currency: string
  description: string | null
  // Campos de alquiler
  isRental?: boolean
  rentalStartDate?: Date | null
  rentalEndDate?: Date | null
  rentalDays?: number | null
  depositPaid?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  workshopId: string
  status: OrderStatus
  totalAmount: number
  currency: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
  workshop?: {
    id: string
    name: string
    ownerId: string
  }
  user?: {
    id: string
    email: string
  }
}

export interface CreateOrderInput {
  userId: string
  workshopId: string
  notes?: string | null
  type?: 'PRODUCT_ORDER' | 'SERVICE_REPAIR' | 'RENTAL'
  items: Array<{
    productId?: string | null
    quantity: number
    priceAtOrder: number
    currency?: string
    description?: string | null
    // Campos de alquiler
    isRental?: boolean
    rentalStartDate?: string | null
    rentalEndDate?: string | null
    rentalDays?: number | null
    depositPaid?: number | null
  }>
}
export interface UpdateOrderStatusInput {
  status: OrderStatus
}
