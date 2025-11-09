import { OrderStatus } from '@prisma/client'
import { z } from 'zod'

export const createOrderItemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive(),
  priceAtOrder: z.number().int().positive(),
  currency: z.string().length(3).optional().default('EUR'),
  description: z.string().optional().nullable(),
})

export const createOrderSchema = z.object({
  workshopId: z.string().uuid(),
  notes: z.string().optional().nullable(),
  items: z.array(createOrderItemSchema).min(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export type CreateOrderDTO = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>
