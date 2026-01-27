import { OidcService, OidcUser } from '../../../domain/services/oidc-service'
import { buildAuthUrl, handleCallback as handleCallbackImpl } from './google-client'
import { generators } from 'openid-client'

/**
 * Implementación del servicio OIDC usando Google OAuth
 */
export class GoogleOidcService implements OidcService {
  async generateAuthorizationUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
    const state = generators.state()
    const codeVerifier = generators.codeVerifier()
    const url = await buildAuthUrl(state)
    return { url, state, codeVerifier }
  }

  async handleCallback(state: string, code: string, codeVerifier: string): Promise<OidcUser> {
    const googleUser = await handleCallbackImpl(state, code, codeVerifier)

    // Mapear de formato Google a formato de dominio
    return {
      sub: googleUser.sub,
      email: googleUser.email,
      emailVerified: googleUser.email_verified,
      name: googleUser.name,
      picture: googleUser.picture,
    }
  }
}
