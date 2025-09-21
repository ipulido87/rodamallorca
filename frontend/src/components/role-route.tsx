import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth'

interface RoleRouteProps {
  children: ReactNode
  requiredRole: 'USER' | 'WORKSHOP_OWNER' | 'ADMIN'
  fallback?: string
}

export const RoleRoute = ({
  children,
  requiredRole,
  fallback = '/home',
}: RoleRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth()

  console.log('RoleRoute Debug:', {
    user,
    userRole: user?.role,
    requiredRole,
    isAuthenticated,
    loading,
  })

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== requiredRole) return <Navigate to={fallback} replace />

  return <>{children}</>
}
