import { z } from 'zod'

// Reusable email schema
export const emailSchema = z
  .string()
  .min(1, 'El email es obligatorio')
  .email('Debe ser un email válido')

// Reusable password schemas
export const passwordSchema = z
  .string()
  .min(1, 'La contraseña es obligatoria')
  .min(6, 'La contraseña debe tener al menos 6 caracteres')

export const passwordWithConfirmationSchema = z
  .string()
  .min(1, 'La contraseña es obligatoria')
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100, 'La contraseña es demasiado larga')

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// Register schema
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordWithConfirmationSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    name: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[+]?[\d\s-()]{6,20}$/.test(val),
        'Número de teléfono inválido'
      ),
    role: z.enum(['USER', 'WORKSHOP_OWNER']).default('USER'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: passwordWithConfirmationSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

// Types inferred from schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
