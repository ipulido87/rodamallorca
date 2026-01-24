import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('').transform(() => undefined)), // Allow empty string to be treated as undefined
  birthDate: z
    .string()
    .datetime({ message: 'Formato de fecha inválido' })
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
