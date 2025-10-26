import { createContext } from 'react'

export type User = {
  id: string
  email: string
  name?: string | null
  picture?: string | null
  birthDate?: string | null
  phone?: string | null
  verified?: boolean
  role?: 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'
  createdAt?: string
  updatedAt?: string
}

export type AuthContextType = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isWorkshopOwner: boolean
  loading: boolean
  authError: string | null // ✅ NUEVO: Error centralizado
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (input: {
    email: string
    password: string
    name: string
    birthDate?: string
    phone?: string
    role?: 'USER' | 'WORKSHOP_OWNER'
  }) => Promise<void>
  verifyCode: (email: string, code: string) => Promise<void>
  resendVerification: (email: string) => Promise<void> // ✅ NUEVO
  refreshMe: () => Promise<void>
  persistToken: (token: string | null) => void
  clearError: () => void // ✅ NUEVO
}

export const AuthContext = createContext<AuthContextType | null>(null)
