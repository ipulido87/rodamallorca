import { z } from 'zod'

/**
 * Schema para validar UUIDs en parámetros de ruta
 */
export const UuidParamSchema = z.object({
  id: z.string().uuid({ message: 'ID debe ser un UUID válido' }),
})

/**
 * Schema para validar múltiples parámetros UUID comunes
 */
export const WorkshopIdParamSchema = z.object({
  workshopId: z.string().uuid({ message: 'workshopId debe ser un UUID válido' }),
})

export const UserIdParamSchema = z.object({
  userId: z.string().uuid({ message: 'userId debe ser un UUID válido' }),
})

export const OrderIdParamSchema = z.object({
  orderId: z.string().uuid({ message: 'orderId debe ser un UUID válido' }),
})

export const ProductIdParamSchema = z.object({
  productId: z.string().uuid({ message: 'productId debe ser un UUID válido' }),
})

/**
 * Schema para paginación en query params
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

/**
 * Schema para búsqueda en query params
 */
export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})
