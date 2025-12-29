import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

// Log para verificar JWT_SECRET en producción
console.log('🔑 [JWT] JWT_SECRET configurado:', SECRET ? '✅' : '❌ MISSING')
if (!SECRET) {
  console.error('❌ [JWT] CRITICAL: JWT_SECRET no está configurado en las variables de entorno')
}

export interface JwtPayload {
  id?: string
  sub?: string
  email: string
  role?: string
}

export function signJwt(payload: JwtPayload) {
  console.log('🔑 [JWT] Firmando token para:', payload.email)
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    console.log('🔑 [JWT] Verificando token...')
    const result = jwt.verify(token, SECRET) as T
    console.log('✅ [JWT] Token válido')
    return result
  } catch (error) {
    console.error('❌ [JWT] Token inválido:', error instanceof Error ? error.message : error)
    return null
  }
}
