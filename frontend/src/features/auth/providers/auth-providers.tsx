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
  setUser: (user: User | null) => void // ✅ Para actualizar usuario en callback handler
  isAuthenticated: boolean
  isWorkshopOwner: boolean
  loading: boolean
  authError: string | null
  login: (email: string, password: string) => Promise<User | null>
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
  resendVerification: (email: string) => Promise<void>
  refreshMe: () => Promise<void>
  persistToken: (token: string | null) => void
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
