import { UserRepository } from '../domain/repositories/user-repository'
import { TokenService } from '../domain/services/token-service'
import { OidcService } from '../domain/services/oidc-service'

interface GoogleLoginParams {
  state: string
  code: string
  cookieState?: string
  role?: string
  codeVerifier: string
}

interface GoogleLoginDeps {
  repo: UserRepository
  tokenService: TokenService
  oidcService: OidcService
}

export async function loginWithGoogleUseCase(
  params: GoogleLoginParams,
  deps: GoogleLoginDeps
) {
  const { state, code, cookieState, role, codeVerifier } = params
  const { repo, tokenService, oidcService } = deps

  console.log('🔍 [USE_CASE] Rol recibido:', role)

  if (!state || state !== cookieState) throw new Error('Invalid state')

  const u = await oidcService.handleCallback(state, code, codeVerifier)
  if (!u.email || !u.emailVerified) throw new Error('Email not verified')

  console.log('🔍 [USE_CASE] Buscando/creando usuario Google:', u.email)

  try {
    // Intentar encontrar usuario existente
    const user = await repo.upsertGoogleUser({
      email: u.email,
      googleId: u.sub,
      name: u.name ?? null,
      picture: u.picture ?? null,
      role: role || 'USER',
    })

    console.log('✅ [USE_CASE] Usuario encontrado/creado:', {
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const token = tokenService.sign({
      id: user.id,
      email: user.email,
      role: user.role || undefined,
    })
    return { user, token }
  } catch (error) {
    // ✅ Si el usuario no existe, lanzar error específico
    if (error instanceof Error && error.message.includes('not found')) {
      throw new Error(
        `User with email ${u.email} not found. Please complete registration.`
      )
    }
    throw error
  }
}
