// src/features/auth/services/auth-service.ts
import { AUTH_ENDPOINTS } from '../../../constants/api'
import { API } from '../../../shared/api'

// Re-export API for backwards compatibility during migration
export { API } from '../../../shared/api'

// ---- Endpoints ----
export async function register(input: {
  email: string
  password: string
  name: string
  birthDate?: string
  phone?: string
  role?: 'USER' | 'WORKSHOP_OWNER'
}) {
  const res = await API.post(AUTH_ENDPOINTS.REGISTER, input)
  return res.data
}

export async function login(email: string, password: string) {
  const res = await API.post(AUTH_ENDPOINTS.LOGIN, { email, password })
  return res.data
}

export async function verifyCode(email: string, code: string) {
  const res = await API.post(AUTH_ENDPOINTS.VERIFY, { email, code })
  return res.data
}

export async function me() {
  const res = await API.get('/auth/me')
  return res.data
}

export async function resendVerification(email: string) {
  const res = await API.post('/auth/resend-verification', { email })
  return res.data
}
