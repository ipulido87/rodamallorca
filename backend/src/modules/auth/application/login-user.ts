import bcrypt from 'bcrypt'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { TokenService } from '../domain/services/token-service'

interface LoginUserDeps {
  userRepo: UserRepository
  tokenService: TokenService
}

export const loginUser = async (
  email: string,
  password: string,
  deps: LoginUserDeps
) => {
  const { userRepo, tokenService } = deps

  const user = await userRepo.findByEmailWithCredentials(email.toLowerCase())

  if (!user) throw new Error('Invalid credentials')
  if (!user.verified) throw new Error('User not verified')
  if (!user.password) throw new Error('Invalid credentials')

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) throw new Error('Invalid credentials')

  const token = tokenService.sign({
    id: user.id,
    email: user.email,
    role: user.role ?? undefined,
  })

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      birthDate: user.birthDate ?? null,
      phone: user.phone ?? null,
      verified: user.verified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  }
}
