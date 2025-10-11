import { saveUser } from '../infrastructure/services/user.service'

export type RegisterInput = {
  email: string
  password: string
  name: string
  birthDate?: Date
  phone?: string
  role?: 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'
}

export const registerUserUseCase = async (input: RegisterInput) => {
  const email = input.email.trim().toLowerCase()
  const user = await saveUser({ ...input, email })
  return user
}
