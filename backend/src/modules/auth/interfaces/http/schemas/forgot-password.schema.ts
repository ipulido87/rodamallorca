import { z } from 'zod'

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Debe ser un email válido')
    .toLowerCase()
    .trim(),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
