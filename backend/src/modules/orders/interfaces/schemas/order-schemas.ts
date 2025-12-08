import { z } from 'zod'
import { OrderStatus } from '../../../orders/domain/enums/order-status'

// Trata null como undefined para que funcione default:
const Currency = z.preprocess(
  (v) => (v == null ? undefined : v),
  z.string().length(3).default('EUR')
)

export const createOrderItemSchema = z
  .object({
    productId: z.string().uuid().optional().nullable(),
    quantity: z.number().int().positive(),
    priceAtOrder: z.number().int().positive(),
    currency: Currency,
    description: z.string().optional().nullable(),
  })
  .superRefine((val, ctx) => {
    if (!val.productId && (!val.description || val.description.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'description es obligatoria cuando no hay productId',
      })
    }
  })

export const createOrderSchema = z.object({
  workshopId: z.string().uuid(),
  // Si te interesa que '' o null -> undefined:
  notes: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.string().optional()
  ),
  items: z.array(createOrderItemSchema).min(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export type CreateOrderDTO = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>
