// src/services/auth-service.ts
import axios from 'axios'
import { API_URL, AUTH_ENDPOINTS } from '../constants/api'

export const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // por si usas cookie httpOnly en /me, google/callback, etc.
})

// ---- Endpoints ----
export async function register(input: {
  email: string
  password: string
  name: string
  birthDate?: string // "YYYY-MM-DD"
  phone?: string
}) {
  const res = await API.post(AUTH_ENDPOINTS.REGISTER, input)
  return res.data // { message, user }
}

export async function login(email: string, password: string) {
  const res = await API.post(AUTH_ENDPOINTS.LOGIN, { email, password })
  return res.data // { token, user }
}

export async function verifyCode(email: string, code: string) {
  const res = await API.post(AUTH_ENDPOINTS.VERIFY, { email, code })
  return res.data // { message, user? }
}

export async function me() {
  const res = await API.get('/auth/me')
  return res.data // { user } | { user: null }
}
