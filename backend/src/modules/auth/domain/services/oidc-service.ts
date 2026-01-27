/**
 * Interfaz del servicio OIDC para abstraer la implementación (Google, GitHub, etc.)
 */

export interface OidcUser {
  sub: string // Subject (user ID del proveedor)
  email: string
  emailVerified: boolean
  name?: string
  picture?: string
}

export interface OidcService {
  /**
   * Genera la URL de autorización para iniciar el flujo OAuth
   */
  generateAuthorizationUrl(): Promise<{ url: string; state: string; codeVerifier: string }>

  /**
   * Maneja el callback de OAuth y obtiene los datos del usuario
   */
  handleCallback(state: string, code: string, codeVerifier: string): Promise<OidcUser>
}
