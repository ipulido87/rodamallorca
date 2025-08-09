import { UserRepository } from '../domain/user-respository'
import { signJwt } from '../infrastructure/jwt/jwt.service'
import { handleCallback } from '../infrastructure/oidc/google-client'

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
