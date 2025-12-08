import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../../../config/config'
import prisma from '../../../lib/prisma'
import { sanitizeUser } from '../../../utils/sanitize-user'

export const loginUser = async (email: string, password: string) => {
  console.log('🔍 [LOGIN_USER] Intentando login con:', email)

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

  // Generar token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  )

  console.log('✅ [LOGIN_USER] Token generado para:', user.email)

  return {
    token,
    user: sanitizeUser(user),
  }
}
