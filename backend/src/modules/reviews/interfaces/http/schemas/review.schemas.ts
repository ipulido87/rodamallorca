import { z } from 'zod'

/**
 * Schema para crear una reseña
 * POST /api/reviews
 */
export const CreateReviewSchema = z.object({
  workshopId: z
    .string()
    .uuid('workshopId debe ser un UUID válido')
    .min(1, 'workshopId es requerido'),
  rating: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  comment: z
    .string()
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
})

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>

/**
 * Schema para actualizar una reseña
 * PUT /api/reviews/:reviewId
 */
export const UpdateReviewSchema = z.object({
  rating: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  comment: z
    .string()
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .optional()
    .nullable(),
})

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>
