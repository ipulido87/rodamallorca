import { z } from 'zod'

/**
 * Schema para un item de producto en el checkout
 */
const CheckoutItemSchema = z.object({
  productId: z
    .string()
    .uuid('productId debe ser un UUID válido')
    .min(1, 'productId es requerido'),
  quantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor que 0')
    .min(1, 'La cantidad mínima es 1')
    .max(1000, 'La cantidad máxima es 1000'),
  priceAtOrder: z
    .number()
    .nonnegative('El precio debe ser mayor o igual a 0')
    .describe('Precio en centavos (ej: 1000 = 10.00€)'),
  currency: z
    .string()
    .length(3, 'La moneda debe tener 3 caracteres (ISO 4217)')
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'La moneda debe estar en formato ISO 4217 (ej: EUR, USD)')
    .default('EUR'),
})

/**
 * Schema para crear una sesión de checkout de productos
 * POST /api/payments/checkout
 */
export const CreateProductCheckoutSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  items: z
    .array(CheckoutItemSchema)
    .min(1, 'Debe incluir al menos un producto')
    .max(100, 'No se pueden comprar más de 100 productos diferentes'),
})

export type CreateProductCheckoutInput = z.infer<typeof CreateProductCheckoutSchema>
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>
