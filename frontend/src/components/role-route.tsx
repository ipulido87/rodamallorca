import type { ReactNode } from 'react'
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

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== requiredRole) {
    return <Navigate to={fallback} replace />
  }

  // If WORKSHOP_OWNER, verify subscription before rendering
  if (requiredRole === 'WORKSHOP_OWNER' && !user?.hasActiveSubscription) {
    return <Navigate to="/activate-subscription" replace />
  }

  return <>{children}</>
}
