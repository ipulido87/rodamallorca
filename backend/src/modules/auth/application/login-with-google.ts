// backend/src/modules/auth/application/login-with-google.ts
import { UserRepository } from '../domain/repositories/user-repository'
import { signJwt } from '../infrastructure/adapters/jwt/jwt.service'
import { handleCallback } from '../infrastructure/adapters/oidc/google-client'

interface GoogleLoginParams {
  state: string
  code: string
  cookieState?: string
  role?: string
  codeVerifier: string // NUEVO - REQUERIDO
}

interface GoogleLoginDeps {
  repo: UserRepository
}

export async function loginWithGoogleUseCase(
  params: GoogleLoginParams,
  deps: GoogleLoginDeps
) {
  const { state, code, cookieState, role, codeVerifier } = params
  const { repo } = deps

  console.log('🔍 [USE_CASE] Rol recibido:', role)

  if (!state || state !== cookieState) throw new Error('Invalid state')

  const u = await handleCallback(state, code, codeVerifier) // ✅ Pasar codeVerifier
  if (!u.email || !u.email_verified) throw new Error('Email not verified')

  console.log('🔍 [USE_CASE] Llamando a upsertGoogleUser con rol:', role)

  const user = await repo.upsertGoogleUser({
    email: u.email,
    googleId: u.sub,
    name: u.name ?? null,
    picture: u.picture ?? null,
    role: role || 'USER',
  })

  console.log('✅ [USE_CASE] Usuario retornado:', {
    email: user.email,
    role: user.role,
  })

  const token = signJwt({
    sub: user.id,
    email: user.email,
    role: user.role || undefined,
  })
  return { user, token }
}
