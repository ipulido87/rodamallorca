import { z } from 'zod'

/**
 * Schema para crear un servicio
 * POST /api/owner/services
 */
export const CreateServiceSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  serviceCategoryId: z
    .string()
    .uuid('serviceCategoryId debe ser un UUID válido')
    .min(1, 'serviceCategoryId es requerido'),
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  price: z
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .nonnegative('El precio debe ser mayor o igual a 0'),
  currency: z
    .string()
    .length(3, 'La moneda debe tener 3 caracteres (ISO 4217)')
    .toUpperCase()
    .default('EUR'),
  duration: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser mayor que 0')
    .optional()
    .describe('Duración en minutos'),
  vehicleType: z
    .enum(['BICYCLE', 'E_BIKE', 'E_SCOOTER', 'ALL'])
    .default('ALL')
    .describe('Tipo de vehículo al que aplica el servicio'),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .default('ACTIVE')
    .describe('Estado del servicio'),
})

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>

/**
 * Schema para actualizar un servicio
 * PATCH /api/owner/services/:id
 */
export const UpdateServiceSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  price: z
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .nonnegative('El precio debe ser mayor o igual a 0')
    .optional(),
  currency: z
    .string()
    .length(3, 'La moneda debe tener 3 caracteres (ISO 4217)')
    .toUpperCase()
    .optional(),
  duration: z
    .number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser mayor que 0')
    .optional(),
  vehicleType: z
    .enum(['BICYCLE', 'E_BIKE', 'E_SCOOTER', 'ALL'])
    .optional(),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .optional(),
  serviceCategoryId: z
    .string()
    .uuid('serviceCategoryId debe ser un UUID válido')
    .optional(),
})

export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>

/**
 * Schema para buscar servicios
 * GET /api/services?...
 */
export const SearchServicesSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .optional(),
  serviceCategoryId: z
    .string()
    .uuid('serviceCategoryId debe ser un UUID válido')
    .optional(),
  vehicleType: z
    .enum(['BICYCLE', 'E_BIKE', 'E_SCOOTER', 'ALL'])
    .optional(),
  status: z
    .enum(['ACTIVE', 'INACTIVE'])
    .optional(),
  city: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),
})

export type SearchServicesInput = z.infer<typeof SearchServicesSchema>
