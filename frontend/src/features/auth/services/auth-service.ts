// src/services/auth-service.ts
import axios from 'axios'
import { API_URL, AUTH_ENDPOINTS } from '../../../constants/api'

export const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// ✅ INTERCEPTOR PARA MANEJAR ERRORES ESPECÍFICOS
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === 'EMAIL_NOT_VERIFIED'
    ) {
      // Mantenemos el error pero con la data específica para que el componente lo maneje
      return Promise.reject({
        ...error,
        isEmailNotVerified: true,
        email: error.response?.data?.email, // Si el backend lo incluye
      })
    }
    return Promise.reject(error)
  }
)

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
