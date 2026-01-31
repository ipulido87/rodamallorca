import { z } from 'zod'

/**
 * Schema para verificar disponibilidad de una bicicleta
 */
export const CheckAvailabilitySchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de inicio invalida',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de fin invalida',
  }),
  quantity: z.coerce.number().int().positive().default(1),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end > start
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
})

/**
 * Schema para calcular precio de alquiler
 */
export const CalculatePriceSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de inicio invalida',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Fecha de fin invalida',
  }),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end > start
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
})

/**
 * Schema para filtros de busqueda de bicis de alquiler
 */
export const RentalFiltersQuerySchema = z.object({
  city: z.string().optional(),
  bikeType: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  bikeSize: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includesHelmet: z.enum(['true', 'false']).optional(),
  includesLock: z.enum(['true', 'false']).optional(),
}).refine((data) => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.maxPrice >= data.minPrice
  }
  return true
}, {
  message: 'maxPrice debe ser mayor o igual a minPrice',
  path: ['maxPrice'],
})

/**
 * Tipos inferidos de los schemas
 */
export type CheckAvailabilityDTO = z.infer<typeof CheckAvailabilitySchema>
export type CalculatePriceDTO = z.infer<typeof CalculatePriceSchema>
export type RentalFiltersQueryDTO = z.infer<typeof RentalFiltersQuerySchema>
