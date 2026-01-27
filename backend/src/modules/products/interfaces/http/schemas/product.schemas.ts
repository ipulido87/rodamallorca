import { z } from 'zod'

/**
 * Schema para las imágenes de productos
 */
export const ImageSchema = z.object({
  original: z.string().url('La URL original debe ser válida'),
  medium: z.string().url('La URL medium debe ser válida'),
  thumbnail: z.string().url('La URL thumbnail debe ser válida'),
})

export type ProductImage = z.infer<typeof ImageSchema>

/**
 * Schema para crear un producto
 * POST /api/owner/products
 */
export const CreateProductSchema = z.object({
  title: z
    .string()
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  price: z
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .nonnegative('El precio debe ser mayor o igual a 0')
    .describe('Precio en centavos (ej: 1000 = 10.00€)'),
  condition: z
    .enum(['new', 'used', 'refurb'])
    .optional()
    .describe('Condición del producto: new (nuevo), used (usado), refurb (reacondicionado)'),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'SOLD'])
    .optional()
    .default('DRAFT')
    .describe('Estado del producto'),
  description: z
    .string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  categoryId: z
    .string()
    .uuid('categoryId debe ser un UUID válido')
    .optional()
    .nullable(),
  images: z
    .array(ImageSchema)
    .min(1, 'Al menos una imagen es requerida')
    .max(10, 'No se pueden agregar más de 10 imágenes'),
  // Campos de alquiler
  isRental: z
    .boolean()
    .optional()
    .default(false)
    .describe('Indica si el producto es para alquiler'),
  rentalPricePerDay: z
    .number()
    .int('El precio por día debe ser un número entero (centavos)')
    .nonnegative('El precio por día debe ser mayor o igual a 0')
    .optional()
    .nullable(),
  rentalPricePerWeek: z
    .number()
    .int('El precio por semana debe ser un número entero (centavos)')
    .nonnegative('El precio por semana debe ser mayor o igual a 0')
    .optional()
    .nullable(),
  availableQuantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor que 0')
    .min(1)
    .optional()
    .default(1),
  bikeType: z
    .string()
    .max(100, 'El tipo de bicicleta no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  bikeSize: z
    .string()
    .max(50, 'El tamaño de bicicleta no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  bikeBrand: z
    .string()
    .max(100, 'La marca no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  bikeModel: z
    .string()
    .max(100, 'El modelo no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  frameSize: z
    .number()
    .positive('El tamaño del cuadro debe ser mayor que 0')
    .optional()
    .nullable(),
  includesHelmet: z
    .boolean()
    .optional()
    .default(false),
  includesLock: z
    .boolean()
    .optional()
    .default(false),
  includesLights: z
    .boolean()
    .optional()
    .default(false),
  depositAmount: z
    .number()
    .int('El depósito debe ser un número entero (centavos)')
    .nonnegative('El depósito debe ser mayor o igual a 0')
    .optional()
    .nullable(),
  minRentalDays: z
    .number()
    .int('Los días mínimos deben ser un número entero')
    .positive('Los días mínimos deben ser mayor que 0')
    .min(1)
    .optional()
    .nullable(),
  maxRentalDays: z
    .number()
    .int('Los días máximos deben ser un número entero')
    .positive('Los días máximos deben ser mayor que 0')
    .min(1)
    .optional()
    .nullable(),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

/**
 * Schema para actualizar un producto
 * PUT /api/owner/products/:id
 */
export const UpdateProductSchema = z.object({
  title: z
    .string()
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),
  price: z
    .number()
    .int('El precio debe ser un número entero (centavos)')
    .nonnegative('El precio debe ser mayor o igual a 0')
    .optional(),
  condition: z
    .enum(['new', 'used', 'refurb'])
    .optional(),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'SOLD'])
    .optional(),
  description: z
    .string()
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional()
    .nullable(),
  categoryId: z
    .string()
    .uuid('categoryId debe ser un UUID válido')
    .optional()
    .nullable(),
  images: z
    .array(ImageSchema)
    .max(10, 'No se pueden agregar más de 10 imágenes')
    .optional(),
  // Campos de alquiler
  isRental: z
    .boolean()
    .optional()
    .describe('Indica si el producto es para alquiler'),
  rentalPricePerDay: z
    .number()
    .int('El precio por día debe ser un número entero (centavos)')
    .nonnegative('El precio por día debe ser mayor o igual a 0')
    .optional()
    .nullable(),
  rentalPricePerWeek: z
    .number()
    .int('El precio por semana debe ser un número entero (centavos)')
    .nonnegative('El precio por semana debe ser mayor o igual a 0')
    .optional()
    .nullable(),
  availableQuantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor que 0')
    .min(1)
    .optional(),
  bikeType: z
    .string()
    .max(100, 'El tipo de bicicleta no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  bikeSize: z
    .string()
    .max(50, 'El tamaño de bicicleta no puede exceder 50 caracteres')
    .optional()
    .nullable(),
  bikeBrand: z
    .string()
    .max(100, 'La marca no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  bikeModel: z
    .string()
    .max(100, 'El modelo no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  frameSize: z
    .number()
    .positive('El tamaño del cuadro debe ser mayor que 0')
    .optional()
    .nullable(),
  includesHelmet: z
    .boolean()
    .optional(),
  includesLock: z
    .boolean()
    .optional(),
  includesLights: z
    .boolean()
    .optional(),
  depositAmount: z
    .number()
    .int('El depósito debe ser un número entero (centavos)')
    .nonnegative('El depósito debe ser mayor o igual a 0')
    .optional()
    .nullable(),
  minRentalDays: z
    .number()
    .int('Los días mínimos deben ser un número entero')
    .positive('Los días mínimos deben ser mayor que 0')
    .min(1)
    .optional()
    .nullable(),
  maxRentalDays: z
    .number()
    .int('Los días máximos deben ser un número entero')
    .positive('Los días máximos deben ser mayor que 0')
    .min(1)
    .optional()
    .nullable(),
})

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
