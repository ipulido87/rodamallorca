import bcrypt from 'bcrypt'
import { sanitizeUser } from '../../../utils/sanitize-user'
import type { UserRepository } from '../domain/repositories/user-repository'
import type { TokenService } from '../domain/services/token-service'
import prisma from '../../../lib/prisma'

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

  console.log('🔍 [LOGIN_USER] Intentando login con:', email)

  // Necesitamos obtener el user completo con password para validar
  // UserRepository solo devuelve UserDTO sin password, así que usamos Prisma directamente aquí
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    console.log('❌ [LOGIN_USER] Usuario no encontrado:', email)
    throw new Error('Invalid credentials')
  }

  console.log('✅ [LOGIN_USER] Usuario encontrado:', user.email)
  console.log('🔍 [LOGIN_USER] Tiene password?', !!user.password)
  console.log('🔍 [LOGIN_USER] Está verificado?', user.verified)

  // ✅ VERIFICAR SI EL USUARIO ESTÁ VERIFICADO
  if (!user.verified) {
    console.log('❌ [LOGIN_USER] Usuario no verificado:', user.email)
    throw new Error('User not verified') // ← Mensaje específico
  }

  if (!user.password) {
    console.log('❌ [LOGIN_USER] Usuario no tiene password:', user.email)
    throw new Error('Invalid credentials')
  }

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) {
    console.log('❌ [LOGIN_USER] Password inválido para:', user.email)
    throw new Error('Invalid credentials')
  }

  console.log('✅ [LOGIN_USER] Password válido para:', user.email)

  // Generar token JWT usando TokenService
  const token = tokenService.sign({
    id: user.id,
    email: user.email,
    role: user.role || undefined,
  })

  console.log('✅ [LOGIN_USER] Token generado para:', user.email)

  return {
    token,
    user: sanitizeUser(user),
  }
}
