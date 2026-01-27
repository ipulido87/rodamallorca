/**
 * Interfaz del servicio de tokens para abstraer la implementación (JWT, etc.)
 */

export interface TokenPayload {
  id: string
  email: string
  role?: string
}

export interface TokenService {
  /**
   * Genera un token de autenticación
   */
  sign(payload: TokenPayload): string

  /**
   * Verifica y decodifica un token
   */
  verify(token: string): TokenPayload

  /**
   * Genera un token de refresh
   */
  generateRefreshToken(userId: string): string
}
