import { z } from 'zod'

/**
 * Schema para crear un cliente
 */
export const CreateCustomerSchema = z.object({
  type: z.enum(['INDIVIDUAL', 'BUSINESS']),
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  taxId: z
    .string()
    .max(20, { message: 'El NIF/CIF no puede exceder 20 caracteres' })
    .optional()
    .nullable(),
  email: z
    .string()
    .email({ message: 'Email invalido' })
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[0-9 ()-]{7,20}$/, { message: 'Telefono invalido' })
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, { message: 'La direccion no puede exceder 200 caracteres' })
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, { message: 'La ciudad no puede exceder 100 caracteres' })
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .max(10, { message: 'El codigo postal no puede exceder 10 caracteres' })
    .optional()
    .nullable(),
  country: z
    .string()
    .max(50, { message: 'El pais no puede exceder 50 caracteres' })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(500, { message: 'Las notas no pueden exceder 500 caracteres' })
    .optional()
    .nullable(),
})

/**
 * Schema para actualizar un cliente (todos los campos opcionales)
 */
export const UpdateCustomerSchema = CreateCustomerSchema.partial()

/**
 * Tipos inferidos de los schemas
 */
export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>
