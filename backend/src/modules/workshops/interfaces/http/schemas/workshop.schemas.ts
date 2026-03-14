import { z } from 'zod'

/**
 * Schema para crear un taller
 * POST /api/owner/workshops
 */
export const CreateWorkshopSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  country: z
    .string()
    .length(2, 'El código de país debe tener 2 caracteres (ISO 3166-1 alpha-2)')
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'El código de país debe estar en formato ISO 3166-1 alpha-2 (ej: ES, FR, US)')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional()
    .nullable(),
})

export type CreateWorkshopInput = z.infer<typeof CreateWorkshopSchema>

/**
 * Schema para actualizar un taller
 * PUT /api/owner/workshops/:id
 */
export const UpdateWorkshopSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  country: z
    .string()
    .length(2, 'El código de país debe tener 2 caracteres (ISO 3166-1 alpha-2)')
    .toUpperCase()
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional()
    .nullable(),
  logoOriginal: z
    .string()
    .url('La URL del logo original debe ser válida')
    .optional()
    .nullable(),
  logoMedium: z
    .string()
    .url('La URL del logo medium debe ser válida')
    .optional()
    .nullable(),
  logoThumbnail: z
    .string()
    .url('La URL del logo thumbnail debe ser válida')
    .optional()
    .nullable(),
})

export type UpdateWorkshopInput = z.infer<typeof UpdateWorkshopSchema>
