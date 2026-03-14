import { z } from 'zod'

/**
 * Schema para crear una sesión de checkout de suscripción
 * POST /api/subscriptions/checkout
 */
export const CreateCheckoutSessionSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
})

export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>

/**
 * Schema para cancelar una suscripción
 * POST /api/subscriptions/cancel
 */
export const CancelSubscriptionSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  immediate: z
    .boolean()
    .optional()
    .default(false)
    .describe('Si se debe cancelar inmediatamente o al final del período'),
})

export type CancelSubscriptionInput = z.infer<typeof CancelSubscriptionSchema>

/**
 * Schema para crear una sesión del portal de facturación
 * POST /api/subscriptions/portal
 */
export const CreatePortalSessionSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
})

export type CreatePortalSessionInput = z.infer<typeof CreatePortalSessionSchema>
