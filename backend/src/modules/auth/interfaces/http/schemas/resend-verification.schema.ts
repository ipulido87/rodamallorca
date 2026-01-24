import { z } from 'zod'

export const ResendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Debe ser un email válido')
    .toLowerCase()
    .trim(),
})

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>
