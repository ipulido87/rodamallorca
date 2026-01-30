import { Request } from 'express'

/**
 * Interfaz para opciones de paginación
 */
export interface PaginationOptions {
  page: number
  size: number
  skip: number
}

/**
 * Extrae y valida parámetros de paginación desde query params
 * Aplica límites máximos para prevenir abuse
 */
export function getPaginationParams(req: Request, defaultSize = 12, maxSize = 50): PaginationOptions {
  const page = Math.max(1, Number(req.query.page) || 1)
  const size = Math.min(maxSize, Math.max(1, Number(req.query.size) || defaultSize))
  const skip = (page - 1) * size

  return { page, size, skip }
}

/**
 * Interfaz para respuesta paginada
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Crea una respuesta paginada estandarizada
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  size: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / size)

  return {
    items,
    total,
    page,
    size,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Extrae filtros comunes de búsqueda desde query params
 */
export function getSearchFilters(req: Request) {
  return {
    q: req.query.q?.toString(),
    city: req.query.city?.toString(),
    country: req.query.country?.toString(),
    categoryId: req.query.categoryId?.toString(),
  }
}

/**
 * Convierte query param a número o undefined
 */
export function parseNumberQuery(value: any): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const num = Number(value)
  return isNaN(num) ? undefined : num
}

/**
 * Convierte query param a booleano
 */
export function parseBooleanQuery(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1'
  }
  return false
}
