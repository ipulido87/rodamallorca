import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../../../config/config'
import prisma from '../../../lib/prisma'
import { sanitizeUser } from '../../../utils/sanitize-user'

export const loginUser = async (email: string, password: string) => {
  // 1) normaliza email
  const emailNorm = email.trim().toLowerCase()

  console.log('🔍 [LOGIN] Intentando login con:', emailNorm)

  // 2) busca usuario
  const user = await prisma.user.findUnique({ where: { email: emailNorm } })
  // devuelve siempre mismo error para no filtrar info
  const invalid = new Error('Invalid credentials')

  if (!user) {
    console.log('❌ [LOGIN] Usuario no encontrado')

    throw invalid
  }

  console.log('✅ [LOGIN] Usuario encontrado:', user.email)
  console.log('🔍 [LOGIN] Tiene password?', !!user.password)
  console.log('🔍 [LOGIN] Está verificado?', user.verified)

  // 3) exige verificación por email (si tu política lo requiere)
  if (!user.verified) {
    throw new Error('Please verify your email before logging in')
  }

  // 4) usuarios de Google no tienen password local
  if (!user.password) {
    console.log('❌ [LOGIN] Usuario sin password (Google?)')

    throw invalid
  }

  console.log(
    '🔍 [LOGIN] Password en BD:',
    user.password.substring(0, 20) + '...'
  )
  console.log('🔍 [LOGIN] Password ingresado:', password)

  // 5) compara password
  const ok = await bcrypt.compare(password, user.password)
  console.log('🔐 [LOGIN] Contraseñas coinciden?', ok)

  if (!ok) {
    console.log('❌ [LOGIN] Password incorrecto')

    throw invalid
  }

  // 6) firma JWT (incluye lo que necesites)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role ?? 'USER' },
    config.jwtSecret,
    { expiresIn: '7d' }
  )

  return { token, user: sanitizeUser(user) }
}
