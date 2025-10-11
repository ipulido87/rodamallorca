import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  id?: string
  sub?: string
  email: string
  role?: string
}

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET) as T
  } catch {
    return null
  }
}
