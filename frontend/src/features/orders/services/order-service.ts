import { API } from '../../auth/services/auth-service'

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  quantity: number
  priceAtOrder: number
  currency: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  workshopId: string
  status: OrderStatus
  totalAmount: number
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  user?: {
    email: string
  }
}

export interface CreateOrderItemData {
  productId?: string | null
  quantity: number
  priceAtOrder: number
  currency?: string
  description?: string | null
}

export interface CreateOrderData {
  workshopId: string
  notes?: string | null
  items: CreateOrderItemData[]
}

export interface UpdateOrderStatusData {
  status: OrderStatus
}

/**
 * Crear un nuevo pedido
 */
export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  const response = await API.post('/orders', data)
  return response.data
}

/**
 * Obtener un pedido por ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await API.get(`/orders/${orderId}`)
  return response.data
}

/**
 * Obtener todos los pedidos del usuario autenticado
 */
export const getMyOrders = async (userId: string): Promise<Order[]> => {
  console.log('🚀 [GETMYORDERS] Iniciando llamada API...')
  console.log('🚀 [GETMYORDERS] UserId:', userId)
  console.log(
    '🚀 [GETMYORDERS] URL completa: http://localhost:4000/api/orders/user/' +
      userId
  )
  const response = await API.get(`/orders/user/${userId}`)
  console.log('✅ [GETMYORDERS] Respuesta recibida:', response)
  console.log('✅ [GETMYORDERS] Datos:', response.data)
  console.log('✅ [GETMYORDERS] Status:', response.status)
  return response.data
}

/**
 * Obtener todos los pedidos de un taller
 */
export const getWorkshopOrders = async (
  workshopId: string
): Promise<Order[]> => {
  const response = await API.get(`/orders/workshop/${workshopId}`)
  return response.data
}

/**
 * Actualizar el estado de un pedido (solo dueño del taller)
 */
export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderStatusData
): Promise<Order> => {
  const response = await API.patch(`/orders/${orderId}/status`, data)
  return response.data
}

/**
 * Cancelar un pedido (solo cliente que lo creó)
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  const response = await API.post(`/orders/${orderId}/cancel`)
  return response.data
}

/**
 * Helper para obtener el label en español del estado
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pendiente',
    [OrderStatus.CONFIRMED]: 'Confirmado',
    [OrderStatus.IN_PROGRESS]: 'En Proceso',
    [OrderStatus.READY]: 'Listo',
    [OrderStatus.COMPLETED]: 'Completado',
    [OrderStatus.CANCELLED]: 'Cancelado',
  }
  return labels[status]
}

/**
 * Helper para obtener el color del estado para Material UI
 */
export const getOrderStatusColor = (
  status: OrderStatus
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' => {
  const colors: Record<
    OrderStatus,
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
  > = {
    [OrderStatus.PENDING]: 'warning',
    [OrderStatus.CONFIRMED]: 'info',
    [OrderStatus.IN_PROGRESS]: 'primary',
    [OrderStatus.READY]: 'secondary',
    [OrderStatus.COMPLETED]: 'success',
    [OrderStatus.CANCELLED]: 'error',
  }
  return colors[status]
}
