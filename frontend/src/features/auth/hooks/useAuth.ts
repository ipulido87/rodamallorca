import { useContext } from 'react'
import { AuthContext } from '../providers/auth-providers'
import type { AuthContextType } from '../providers/auth-providers'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
