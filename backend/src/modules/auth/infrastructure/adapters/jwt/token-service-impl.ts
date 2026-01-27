import { TokenService, TokenPayload } from '../../../domain/services/token-service'
import { signJwt, verifyJwt } from './jwt.service'

/**
 * Implementación del servicio de tokens usando JWT
 */
export class JwtTokenService implements TokenService {
  sign(payload: TokenPayload): string {
    return signJwt(payload)
  }

  verify(token: string): TokenPayload {
    return verifyJwt(token) as TokenPayload
  }

  generateRefreshToken(userId: string): string {
    // Por ahora usamos el mismo mecanismo
    return signJwt({ id: userId, email: '', role: undefined })
  }
}
