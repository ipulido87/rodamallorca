// backend/src/modules/auth/application/login-with-google.ts
import { UserRepository } from '../domain/repositories/user-repository'
import { signJwt } from '../infrastructure/adapters/jwt/jwt.service'
import { handleCallback } from '../infrastructure/adapters/oidc/google-client'

interface GoogleLoginParams {
  state: string
  code: string
  cookieState?: string
  role?: string
}

interface GoogleLoginDeps {
  repo: UserRepository
}

export async function loginWithGoogleUseCase(
  params: GoogleLoginParams,
  deps: GoogleLoginDeps
) {
  const { state, code, cookieState, role } = params
  const { repo } = deps

  if (!state || state !== cookieState) throw new Error('Invalid state')

  const u = await handleCallback(state, code)
  if (!u.email || !u.email_verified) throw new Error('Email not verified')

  const user = await repo.upsertGoogleUser({
    email: u.email,
    googleId: u.sub,
    name: u.name ?? null,
    picture: u.picture ?? null,
    role: role || 'USER',
  })

  const token = signJwt({ sub: user.id, email: user.email })
  return { user, token }
}