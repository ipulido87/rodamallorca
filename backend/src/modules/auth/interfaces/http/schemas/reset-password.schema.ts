import { z } from 'zod'

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es obligatorio'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
