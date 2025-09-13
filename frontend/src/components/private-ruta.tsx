import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null // o un spinner
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}
