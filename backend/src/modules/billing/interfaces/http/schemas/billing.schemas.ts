import { z } from 'zod'

/**
 * Schema para crear un cliente
 * POST /api/owner/billing/customers
 */
export const CreateCustomerSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  type: z
    .enum(['INDIVIDUAL', 'BUSINESS'])
    .optional()
    .default('INDIVIDUAL')
    .describe('Tipo de cliente: individual o empresa'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  taxId: z
    .string()
    .max(50, 'El NIF/CIF no puede exceder 50 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional(),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional(),
  city: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),
  postalCode: z
    .string()
    .max(20, 'El código postal no puede exceder 20 caracteres')
    .optional(),
  country: z
    .string()
    .max(100, 'El país no puede exceder 100 caracteres')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
})

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>

/**
 * Schema para un item de factura
 */
export const InvoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  quantity: z
    .number()
    .positive('La cantidad debe ser mayor que 0')
    .min(0.01, 'La cantidad mínima es 0.01'),
  unitPrice: z
    .number()
    .int('El precio unitario debe ser un número entero (centavos)')
    .nonnegative('El precio unitario debe ser mayor o igual a 0'),
  discount: z
    .number()
    .int('El descuento debe ser un número entero (centavos)')
    .nonnegative('El descuento debe ser mayor o igual a 0')
    .optional()
    .default(0),
  taxRate: z
    .number()
    .min(0, 'La tasa de impuesto debe ser mayor o igual a 0')
    .max(100, 'La tasa de impuesto no puede exceder 100%')
    .optional()
    .default(0),
})

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>

/**
 * Schema para crear una factura
 * POST /api/owner/billing/invoices
 */
export const CreateInvoiceSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  customerId: z
    .string()
    .uuid('customerId debe ser un UUID válido')
    .optional(),
  seriesId: z
    .string()
    .uuid('seriesId debe ser un UUID válido')
    .min(1, 'seriesId es requerido'),
  issueDate: z
    .string()
    .datetime({ message: 'Formato de fecha de emisión inválido' })
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Formato de fecha de vencimiento inválido' })
    .optional(),
  status: z
    .enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
    .optional()
    .default('DRAFT')
    .describe('Estado de la factura'),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
  internalNotes: z
    .string()
    .max(2000, 'Las notas internas no pueden exceder 2000 caracteres')
    .optional(),
  paymentMethod: z
    .string()
    .max(100, 'El método de pago no puede exceder 100 caracteres')
    .optional(),
  items: z
    .array(InvoiceItemSchema)
    .min(1, 'Debe incluir al menos un item')
    .max(100, 'No se pueden incluir más de 100 items'),
})

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>

/**
 * Schema para actualizar una factura
 * PATCH /api/owner/billing/invoices/:id
 */
export const UpdateInvoiceSchema = z.object({
  customerId: z
    .string()
    .uuid('customerId debe ser un UUID válido')
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Formato de fecha de vencimiento inválido' })
    .optional(),
  status: z
    .enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
    .optional(),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
  internalNotes: z
    .string()
    .max(2000, 'Las notas internas no pueden exceder 2000 caracteres')
    .optional(),
  paymentMethod: z
    .string()
    .max(100, 'El método de pago no puede exceder 100 caracteres')
    .optional(),
  paidAt: z
    .string()
    .datetime({ message: 'Formato de fecha de pago inválido' })
    .optional(),
})

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>

/**
 * Schema para crear una serie de facturas
 * POST /api/owner/billing/invoice-series
 */
export const CreateInvoiceSeriesSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  prefix: z
    .string()
    .min(1, 'El prefijo es requerido')
    .max(10, 'El prefijo no puede exceder 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El prefijo solo puede contener letras mayúsculas, números y guiones'),
  year: z
    .number()
    .int('El año debe ser un número entero')
    .min(2000, 'El año mínimo es 2000')
    .max(2100, 'El año máximo es 2100'),
  isDefault: z
    .boolean()
    .optional()
    .default(false)
    .describe('Indica si esta es la serie por defecto'),
})

export type CreateInvoiceSeriesInput = z.infer<typeof CreateInvoiceSeriesSchema>
