/**
 * Errores de negocio personalizados con códigos de estado HTTP
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No tienes permisos para realizar esta acción') {
    super(message, 403, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message: string = 'Debes iniciar sesión para continuar') {
    super(message, 401, 'UNAUTHENTICATED')
    this.name = 'UnauthenticatedError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST')
    this.name = 'BadRequestError'
  }
}

/**
 * Verifica que un recurso exista, lanza NotFoundError si es null
 */
export function assertExists<T>(
  resource: T | null | undefined,
  resourceName: string = 'Recurso'
): asserts resource is T {
  if (!resource) {
    throw new NotFoundError(resourceName)
  }
}

/**
 * Verifica una condición, lanza error si es falsa
 */
export function assert(condition: boolean, message: string, statusCode = 400): asserts condition {
  if (!condition) {
    throw new AppError(message, statusCode)
  }
}

/**
 * Verifica propiedad de recurso, lanza UnauthorizedError si no coincide
 */
export function assertOwnership(resourceOwnerId: string, userId: string): void {
  if (resourceOwnerId !== userId) {
    throw new UnauthorizedError('No tienes permisos para acceder a este recurso')
  }
}
