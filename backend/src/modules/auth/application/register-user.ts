import { UserRepository } from '../domain/repositories/user-repository'

export type RegisterInput = {
  email: string
  password: string
  name: string
  birthDate?: Date
  phone?: string
  role?: 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'
}

interface RegisterUserDeps {
  userRepo: UserRepository
}

export const registerUserUseCase = async (
  input: RegisterInput,
  deps: RegisterUserDeps
) => {
  const email = input.email.trim().toLowerCase()
  const user = await deps.userRepo.create({ ...input, email })
  return user
}
