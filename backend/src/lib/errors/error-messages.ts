/**
 * Mensajes de error centralizados para mantener consistencia
 */

export const ERRORS = {
  NOT_FOUND: (entityName: string) => `${entityName} no encontrado`,

  NO_PERMISSION: (action: string) => `No tienes permisos para ${action}`,

  ALREADY_EXISTS: (field: string) => `Ya existe un registro con ese ${field}`,

  INVALID_RANGE: (field: string, min: number, max: number) =>
    `${field} debe estar entre ${min} y ${max}`,

  WORKSHOP_NOT_FOUND: 'Taller no encontrado',

  NOT_WORKSHOP_OWNER: 'No eres el propietario de este taller',

  NOT_RESOURCE_OWNER: 'No tienes permiso para acceder a este recurso',

  INVALID_TRANSITION: (from: string, to: string) =>
    `Transición inválida de ${from} a ${to}`,
} as const

export type ErrorMessage = typeof ERRORS
