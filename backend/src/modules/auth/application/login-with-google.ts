import { UserRepository } from '../domain/repositories/user-repository'
import { signJwt } from '../infrastructure/adapters/jwt/jwt.service'
import { handleCallback } from '../infrastructure/adapters/oidc/google-client'

export async function loginWithGoogleUseCase(params: {
  state: string
  code: string
  cookieState?: string
  repo: UserRepository
}) {
  const { state, code, cookieState, repo } = params
  if (!state || state !== cookieState) throw new Error('Invalid state')

  const u = await handleCallback(state, code)
  if (!u.email || !u.email_verified) throw new Error('Email not verified')

  const user = await repo.upsertGoogleUser({
    email: u.email,
    googleId: u.sub,
    name: u.name ?? null,
    picture: u.picture ?? null,
  })

  const token = signJwt({ sub: user.id, email: user.email })
  return { user, token }
}
