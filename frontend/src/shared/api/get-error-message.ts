import { isAxiosError } from 'axios'

/**
 * Extrae un mensaje de error legible de cualquier error,
 * incluyendo respuestas de axios con formato { error: string } o { message: string }.
 */
export function getErrorMessage(error: unknown, fallback = 'Ha ocurrido un error'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (typeof data?.error === 'string') return data.error
    if (typeof data?.message === 'string') return data.message
  }

  if (error instanceof Error) return error.message

  return fallback
}
