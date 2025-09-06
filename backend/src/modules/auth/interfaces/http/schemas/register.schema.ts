import { z } from 'zod'

export const RegisterUserSchema = z.object({
  name: z.string().min(2, { message: 'Name is too short' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Min 8 characters' }),
  birthDate: z.coerce.date().optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9 ]{7,15}$/, { message: 'Invalid phone' })
    .optional(),
  role: z.enum(['USER', 'WORKSHOP_OWNER']).optional(),
})
