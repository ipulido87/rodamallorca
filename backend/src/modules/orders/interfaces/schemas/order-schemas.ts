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
    // Campos de alquiler
    isRental: z.boolean().optional().default(false),
    rentalStartDate: z.string().optional().nullable(),
    rentalEndDate: z.string().optional().nullable(),
    rentalDays: z.number().int().positive().optional().nullable(),
    depositPaid: z.number().int().min(0).optional().nullable(),
  })
  .superRefine((val, ctx) => {
    // Validación 1: productId o description son requeridos
    if (!val.productId && (!val.description || val.description.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['description'],
        message: 'description es obligatoria cuando no hay productId',
      })
    }

    // Validación 2: Si es rental, las fechas son requeridas
    if (val.isRental) {
      if (!val.rentalStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rentalStartDate'],
          message: 'rentalStartDate es requerida cuando isRental=true',
        })
      }
      if (!val.rentalEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rentalEndDate'],
          message: 'rentalEndDate es requerida cuando isRental=true',
        })
      }
      if (!val.rentalDays || val.rentalDays <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rentalDays'],
          message: 'rentalDays debe ser mayor a 0 cuando isRental=true',
        })
      }
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
  // Tipo de orden: PRODUCT_ORDER, SERVICE_REPAIR, RENTAL
  type: z.enum(['PRODUCT_ORDER', 'SERVICE_REPAIR', 'RENTAL']).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export const cancelOrderSchema = z.object({
  cancellationReason: z.string().optional().nullable(),
})

export type CreateOrderDTO = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>
export type CancelOrderDTO = z.infer<typeof cancelOrderSchema>
