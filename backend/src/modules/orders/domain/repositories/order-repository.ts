import { OrderStatus } from '@prisma/client'
import type {
  CreateOrderInput,
  Order,
  UpdateOrderStatusInput,
} from '../entities/order'

export interface OrderRepository {
  /**
   * Crea un nuevo pedido con sus items
   */
  create(input: CreateOrderInput): Promise<Order>

  /**
   * Busca un pedido por ID, opcionalmente incluyendo items
   */
  findById(id: string, includeItems?: boolean): Promise<Order | null>

  /**
   * Busca todos los pedidos realizados por un usuario
   */
  findByUserId(userId: string, includeItems?: boolean): Promise<Order[]>

  /**
   * Busca todos los pedidos recibidos por un taller
   */
  findByWorkshopId(
    workshopId: string,
    includeItems?: boolean
  ): Promise<Order[]>

  /**
   * Actualiza el estado de un pedido
   */
  updateStatus(id: string, input: UpdateOrderStatusInput): Promise<Order>

  /**
   * Busca pedidos por estado
   */
  findByStatus(
    status: OrderStatus,
    includeItems?: boolean
  ): Promise<Order[]>

  /**
   * Elimina un pedido (solo para admins o casos específicos)
   */
  delete(id: string): Promise<void>
}
