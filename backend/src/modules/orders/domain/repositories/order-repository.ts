import type { Order } from '../entities/order'
import type { OrderStatus } from '../enums/order-status'

export interface CreateOrderRepoItem {
  productId: string | null
  quantity: number
  priceAtOrder: number
  currency: string
  description: string | null
}

export interface CreateOrderRepoInput {
  userId: string
  workshopId: string
  notes: string | null
  totalAmount: number
  items: CreateOrderRepoItem[]
}

export interface OrderRepository {
  create(input: CreateOrderRepoInput): Promise<Order>
  findById(id: string, includeItems?: boolean): Promise<Order | null>
  findByUserId(userId: string, includeItems?: boolean): Promise<Order[]>
  findByWorkshopId(workshopId: string, includeItems?: boolean): Promise<Order[]>
  updateStatus(id: string, input: { status: OrderStatus }): Promise<Order>
  findByStatus(status: OrderStatus, includeItems?: boolean): Promise<Order[]>
  delete(id: string): Promise<void>
}
